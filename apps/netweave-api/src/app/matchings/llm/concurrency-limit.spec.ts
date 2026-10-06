import { createConcurrencyLimit } from './concurrency-limit';

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe('createConcurrencyLimit', () => {
  it('runs at most max tasks at once and starts queued ones in order as others finish', async () => {
    const limit = createConcurrencyLimit(2);
    const started: number[] = [];
    const finish: (() => void)[] = [];
    const task = (id: number) => () =>
      new Promise<number>((resolve) => {
        started.push(id);
        finish[id] = () => resolve(id);
      });

    const results = Promise.all([1, 2, 3, 4].map((id) => limit(task(id))));
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

  it('passes on failures and keeps going', async () => {
    const limit = createConcurrencyLimit(1);

    const failing = limit(() => Promise.reject(new Error('boom')));
    const next = limit(() => Promise.resolve('ok'));

    await expect(failing).rejects.toThrow('boom');
    await expect(next).resolves.toBe('ok');
  });
});
