import { isEqual } from './isEqual.array.helper';

describe('isEqual array', () => {
  it('should return true for arrays with the same elements in the same order', () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return true for arrays with the same elements in different orders', () => {
    expect(isEqual([1, 2, 3], [3, 2, 1])).toBe(true);
  });

  it('should return false for arrays with different lengths', () => {
    expect(isEqual([1, 2, 3], [1, 2])).toBe(false);
  });

  it('should return false for arrays with different elements', () => {
    expect(isEqual([1, 2, 3], [4, 5, 6])).toBe(false);
  });

  it('should return true for empty arrays', () => {
    expect(isEqual([], [])).toBe(true);
  });
});
