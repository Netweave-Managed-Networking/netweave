/** sliding window per key, in memory, so it only holds for a single api instance */
export class RateLimiter {
  private readonly calls = new Map<string | number, number[]>();

  public constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** counts the call, false once the key used up its calls within the window */
  public tryAcquire(key: string | number): boolean {
    const now = this.now();
    const recent = (this.calls.get(key) ?? []).filter(
      (time) => time > now - this.windowMs,
    );
    const allowed = recent.length < this.limit;
    if (allowed) recent.push(now);
    this.calls.set(key, recent);
    return allowed;
  }
}
