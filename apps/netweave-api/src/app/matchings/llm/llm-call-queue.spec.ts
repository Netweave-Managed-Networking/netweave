import { Logger } from '@nestjs/common';
import { APICallError } from 'ai';
import { LlmCallQueue, LlmCallQueueOptions } from './llm-call-queue';

const tick = () => new Promise((resolve) => setImmediate(resolve));

const apiError = (
  statusCode: number,
  responseHeaders?: Record<string, string>,
) =>
  new APICallError({
    message: `HTTP ${statusCode}`,
    url: 'https://llm.example',
    requestBodyValues: {},
    statusCode,
    responseHeaders,
  });

const queue = (options: Partial<LlmCallQueueOptions> = {}) =>
  new LlmCallQueue({
    concurrency: 5,
    rateLimit: null,
    maxRetries: 3,
    rateLimitBackoffMs: 5,
    retryDelayMs: 1,
    ...options,
  });

/** a task failing with the given errors, one per attempt, and succeeding afterwards */
const failingWith = (...errors: Error[]) => {
  const task = jest.fn(async () => {
    const error = errors[task.mock.calls.length - 1];
    if (error) throw error;
    return 'ok';
  });
  return task;
};

describe('LlmCallQueue', () => {
  beforeEach(() => jest.spyOn(Logger.prototype, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('runs at most concurrency calls at once and starts queued ones in order as others finish', async () => {
    const limit = queue({ concurrency: 2 });
    const started: number[] = [];
    const finish: (() => void)[] = [];
    const task = (id: number) => () =>
      new Promise<number>((resolve) => {
        started.push(id);
        finish[id] = () => resolve(id);
      });

    const results = Promise.all([1, 2, 3, 4].map((id) => limit.run(task(id))));
    await tick();
    expect(started).toEqual([1, 2]);

    finish[2]();
    await tick();
    expect(started).toEqual([1, 2, 3]);

    finish[1]();
    finish[3]();
    await tick();
    finish[4]();

    expect(await results).toEqual([1, 2, 3, 4]);
  });

  it('starts no more calls within the interval than the rate limit allows', async () => {
    const limit = queue({ rateLimit: { requests: 2, intervalMs: 100 } });
    const startedAt: number[] = [];
    const task = async () => startedAt.push(Date.now());

    await Promise.all([1, 2, 3].map(() => limit.run(task)));

    expect(startedAt[1] - startedAt[0]).toBeLessThan(50);
    expect(startedAt[2] - startedAt[0]).toBeGreaterThanOrEqual(95); // timers may fire a little early
  });

  it('retries a call rejected with 429 until it succeeds, without a limit of retries', async () => {
    const limit = queue({ maxRetries: 1 });
    const task = failingWith(...Array.from({ length: 6 }, () => apiError(429)));

    await expect(limit.run(task)).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(7);
  });

  it('pauses all calls after a 429 and retries the rate limited call before any new one', async () => {
    const limit = queue({ concurrency: 1, rateLimitBackoffMs: 50 });
    const order: string[] = [];
    let first = true;

    const limited = limit.run(async () => {
      order.push('limited');
      if (first) {
        first = false;
        throw apiError(429);
      }
    });
    const startedAt = Date.now();
    let fresh = 0;
    const later = limit.run(async () => {
      fresh = Date.now();
      order.push('fresh');
    });

    await Promise.all([limited, later]);
    expect(order).toEqual(['limited', 'limited', 'fresh']);
    expect(fresh - startedAt).toBeGreaterThanOrEqual(45);
  });

  it('waits as long as a retry-after header says, if the provider sends one', async () => {
    const limit = queue({ rateLimitBackoffMs: 60_000 });
    const task = failingWith(apiError(429, { 'retry-after': '0.01' }));

    await expect(limit.run(task)).resolves.toBe('ok'); // would time out with the 60s backoff
  });

  it('retries other transient errors only maxRetries times', async () => {
    const limit = queue({ maxRetries: 2 });
    const recovering = failingWith(apiError(503), apiError(500));
    const failing = failingWith(apiError(503), apiError(503), apiError(503));

    await expect(limit.run(recovering)).resolves.toBe('ok');
    await expect(limit.run(failing)).rejects.toThrow('HTTP 503');
    expect(failing).toHaveBeenCalledTimes(3);
  });

  it('fails right away on errors that are not transient, and keeps going', async () => {
    const limit = queue({ concurrency: 1 });
    const failing = failingWith(apiError(401));

    await expect(limit.run(failing)).rejects.toThrow('HTTP 401');
    await expect(limit.run(failingWith(new Error('boom')))).rejects.toThrow(
      'boom',
    );
    await expect(limit.run(async () => 'next')).resolves.toBe('next');
    expect(failing).toHaveBeenCalledTimes(1);
  });

  it('drops waiting calls, also rate limited ones, once their signal is aborted', async () => {
    const limit = queue({ concurrency: 1, rateLimitBackoffMs: 60_000 });
    const abort = new AbortController();
    const limited = failingWith(apiError(429));
    const waiting = jest.fn(async () => 'never');

    const results = [
      limit.run(limited, abort.signal),
      limit.run(waiting, abort.signal),
    ];
    await tick();
    abort.abort(new Error('run failed'));

    for (const result of results) {
      await expect(result).rejects.toThrow('run failed');
    }
    expect(limited).toHaveBeenCalledTimes(1);
    expect(waiting).not.toHaveBeenCalled();
  });
});
