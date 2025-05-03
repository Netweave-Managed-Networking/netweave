export type PickStringAsNumber<T> = Required<{
  [K in keyof T as T[K] extends string | null | undefined ? K : never]: number;
}>;
