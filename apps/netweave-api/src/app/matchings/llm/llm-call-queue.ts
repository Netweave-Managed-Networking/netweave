import { Logger } from '@nestjs/common';
import { APICallError } from 'ai';
import { RateLimit } from './llm-rate-limits';

export interface LlmCallQueueOptions {
  concurrency: number;
  rateLimit: RateLimit | null;
  maxRetries: number;
  rateLimitBackoffMs: number;
  retryDelayMs: number;
}

interface Call {
  task: () => Promise<unknown>;
  resolve: (result: unknown) => void;
  reject: (error: unknown) => void;
  signal: AbortSignal | undefined;
  failedAttempts: number;
}

/**
 * Runs llm calls within the concurrency and rate limit.
 * Calls rejected with a 429 go to the error queue and are retried until they succeed.
 * Any other error fails the call, transient ones (5xx, ...) only after `maxRetries` retries.
 */
export class LlmCallQueue {
  private readonly logger = new Logger(LlmCallQueue.name);
  private waiting: Call[] = [];
  private errorQueue: Call[] = [];
  private readonly startTimes: number[] = [];
  private readonly watchedSignals = new WeakSet<AbortSignal>();
  private running = 0;
  private pausedUntil = 0;
  private wakeUpTimer: NodeJS.Timeout | undefined;

  public constructor(private readonly options: LlmCallQueueOptions) {}

  public run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) return Promise.reject(signal.reason);
    if (signal) this.dropCallsOnAbort(signal);

    return new Promise<T>((resolve, reject) => {
      this.waiting.push({
        task,
        resolve: (result) => resolve(result as T),
        reject,
        signal,
        failedAttempts: 0,
      });
      this.startNextCalls();
    });
  }

  private startNextCalls(): void {
    while (this.running < this.options.concurrency) {
      const queue = this.errorQueue.length > 0 ? this.errorQueue : this.waiting;
      if (queue.length === 0) return;

      const waitMs = this.msUntilNextStart();
      if (waitMs > 0) {
        this.wakeUpIn(waitMs);
        return;
      }

      void this.start(queue.shift() as Call);
    }
  }

  private async start(call: Call): Promise<void> {
    this.running++;
    if (this.options.rateLimit) this.startTimes.push(Date.now());

    try {
      call.resolve(await call.task());
    } catch (error) {
      this.handleFailure(call, error);
    } finally {
      this.running--;
      this.startNextCalls();
    }
  }

  private handleFailure(call: Call, error: unknown): void {
    if (call.signal?.aborted) {
      call.reject(error);
    } else if (isRateLimited(error)) {
      this.errorQueue.push(call);
      this.pauseFor(retryAfterMs(error) ?? this.options.rateLimitBackoffMs);
    } else if (
      isTransient(error) &&
      call.failedAttempts < this.options.maxRetries
    ) {
      const delayMs = this.options.retryDelayMs * 2 ** call.failedAttempts;
      call.failedAttempts++;
      this.logger.warn(
        `Llm call failed (${errorMessage(error)}), retry ${call.failedAttempts} of ${this.options.maxRetries} in ${delayMs}ms`,
      );
      setTimeout(() => this.retry(call), delayMs);
    } else {
      call.reject(error);
    }
  }

  private retry(call: Call): void {
    if (call.signal?.aborted) {
      call.reject(call.signal.reason);
      return;
    }
    this.errorQueue.push(call);
    this.startNextCalls();
  }

  private pauseFor(ms: number): void {
    this.pausedUntil = Math.max(this.pausedUntil, Date.now() + ms);
    this.logger.warn(
      `Rate limit exceeded (429), pausing llm calls for ${Math.round(ms / 1000)}s; ` +
        `${this.errorQueue.length} call(s) in the error queue`,
    );
  }

  private msUntilNextStart(): number {
    const now = Date.now();
    const untilPauseEnds = this.pausedUntil - now;

    const { rateLimit } = this.options;
    if (!rateLimit) return untilPauseEnds;

    const intervalStart = now - rateLimit.intervalMs;
    while (this.startTimes.length > 0 && this.startTimes[0] <= intervalStart) {
      this.startTimes.shift();
    }
    if (this.startTimes.length < rateLimit.requests) return untilPauseEnds;

    const untilOldestStartExpires = this.startTimes[0] - intervalStart;
    return Math.max(untilPauseEnds, untilOldestStartExpires);
  }

  private wakeUpIn(ms: number): void {
    if (this.wakeUpTimer) return;
    this.wakeUpTimer = setTimeout(() => {
      this.wakeUpTimer = undefined;
      this.startNextCalls();
    }, ms);
  }

  // one listener per signal, as a single matching run queues thousands of calls with the same signal
  private dropCallsOnAbort(signal: AbortSignal): void {
    if (this.watchedSignals.has(signal)) return;
    this.watchedSignals.add(signal);

    signal.addEventListener(
      'abort',
      () => {
        const isDropped = (call: Call) => call.signal === signal;
        const dropped = [...this.waiting, ...this.errorQueue].filter(isDropped);
        this.waiting = this.waiting.filter((call) => !isDropped(call));
        this.errorQueue = this.errorQueue.filter((call) => !isDropped(call));
        dropped.forEach((call) => call.reject(signal.reason));

        if (this.waiting.length === 0 && this.errorQueue.length === 0) {
          clearTimeout(this.wakeUpTimer);
          this.wakeUpTimer = undefined;
        }
      },
      { once: true },
    );
  }
}

const isRateLimited = (error: unknown): error is APICallError =>
  APICallError.isInstance(error) && error.statusCode === 429;

const isTransient = (error: unknown): boolean =>
  APICallError.isInstance(error) && error.isRetryable;

// retry-after holds either seconds or an http date
const retryAfterMs = (error: APICallError): number | undefined => {
  const retryAfter = error.responseHeaders?.['retry-after'];
  if (!retryAfter) return undefined;

  const seconds = Number(retryAfter);
  const ms = Number.isNaN(seconds)
    ? Date.parse(retryAfter) - Date.now()
    : seconds * 1000;
  return Number.isNaN(ms) ? undefined : Math.max(ms, 0);
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
