import { isEqual } from './isEqual.object.helper';

describe('isEqual object', () => {
  it('should return true for two empty objects', () => {
    expect(isEqual({}, {})).toBe(true);
  });

  it('should return true for objects with the same keys and values', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('should return false for objects with different keys', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
  });

  it('should return false for objects with different values', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });

  it('should return false for objects with different lengths', () => {
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('should return true for nested objects with the same structure and values', () => {
    expect(isEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
  });

  it('should return false for nested objects with different structures', () => {
    expect(isEqual({ a: { b: 2 } }, { a: { c: 2 } })).toBe(false);
  });

  it('should return false for nested objects with different values', () => {
    expect(isEqual({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false);
  });

  it('should return false for objects with different types', () => {
    expect(isEqual({ a: 1 }, { a: '1' })).toBe(false);
  });

  it('should return true for objects with the same reference', () => {
    const obj = { a: 1 };
    expect(isEqual(obj, obj)).toBe(true);
  });
});
