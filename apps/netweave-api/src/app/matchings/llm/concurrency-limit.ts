export type ConcurrencyLimit = <T>(task: () => Promise<T>) => Promise<T>;

export const createConcurrencyLimit = (max: number): ConcurrencyLimit => {
  let active = 0;
  const queue: (() => void)[] = [];

  const next = () => {
    if (active >= max) return;
    const start = queue.shift();
    if (!start) return;
    active++;
    start();
  };

  return <T>(task: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      queue.push(() =>
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          }),
      );
      next();
    });
};
