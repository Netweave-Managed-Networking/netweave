import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  it('allows `limit` calls per key within the window, then again once the oldest left it', () => {
    let now = 0;
    const limiter = new RateLimiter(2, 1000, () => now);

    expect(limiter.tryAcquire('a')).toBe(true);
    now = 500;
    expect(limiter.tryAcquire('a')).toBe(true);
    expect(limiter.tryAcquire('a')).toBe(false);
    expect(limiter.tryAcquire('b')).toBe(true);

    now = 1000;
    expect(limiter.tryAcquire('a')).toBe(true);
    expect(limiter.tryAcquire('a')).toBe(false);
  });

  it('does not count rejected calls', () => {
    let now = 0;
    const limiter = new RateLimiter(1, 1000, () => now);

    limiter.tryAcquire('a');
    now = 900;
    expect(limiter.tryAcquire('a')).toBe(false);
    now = 1000;
    expect(limiter.tryAcquire('a')).toBe(true);
  });
});
