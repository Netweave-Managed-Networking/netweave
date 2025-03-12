export type PickStringAsNumber<T> = Required<{
  [K in keyof T as T[K] extends string | undefined ? K : never]: number;
}>;
