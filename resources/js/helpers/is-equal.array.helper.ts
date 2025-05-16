export const isEqual = (as: number[], bs: number[]): boolean => {
  if (as.length !== bs.length) return false;
  return as.every((a) => bs.includes(a));
};
