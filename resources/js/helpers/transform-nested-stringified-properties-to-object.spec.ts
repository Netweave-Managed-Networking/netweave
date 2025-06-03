import { transformNestedStringifiedPropertiesToObject } from './transform-nested-stringified-properties-to-object';

describe('transformNestedStringifiedPropertiesToObject', () => {
  it('should transform a single nested property', () => {
    const input = { 'a.b': 'value' };
    const expected = { a: { b: 'value' } };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle multiple nested properties', () => {
    const input = { 'a.b': 'value1', 'a.c': 'value2' };
    const expected = { a: { b: 'value1', c: 'value2' } };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle non-nested properties', () => {
    const input = { key: 'value' };
    const expected = { key: 'value' };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle a mix of nested and non-nested properties', () => {
    const input = { 'a.b': 'value1', key: 'value2' };
    const expected = { a: { b: 'value1' }, key: 'value2' };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle deeply nested properties', () => {
    const input = { 'a.b.c': 'value' };
    const expected = { a: { b: { c: 'value' } } };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle empty objects', () => {
    const input = {};
    const expected = {};
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle properties with no dots', () => {
    const input = { key: 'value', anotherKey: 'anotherValue' };
    const expected = { key: 'value', anotherKey: 'anotherValue' };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should overwrite properties if keys conflict', () => {
    const input = { 'a.b': 'value1', a: 'value2' };
    const expected = { a: 'value2' }; // Later key overwrites earlier one
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle null or undefined values', () => {
    const input = { 'a.b': null, key: undefined };
    const expected = { a: { b: null }, key: undefined };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });

  it('should handle numeric keys', () => {
    const input = { '1.2': 'value' };
    const expected = { 1: { 2: 'value' } };
    expect(transformNestedStringifiedPropertiesToObject(input)).toEqual(expected);
  });
});
