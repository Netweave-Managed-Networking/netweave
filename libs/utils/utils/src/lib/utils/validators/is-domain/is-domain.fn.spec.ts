import { describe, expect, it } from 'vitest';
import { isDomain } from './is-domain.fn';

describe('isDomain', () => {
  describe('emails => invalid', () => {
    it.each([
      ['user@example.com', false],
      ['user@mail.example.com', false],
    ])('isEmailOrDomain(%s) → %s', (input, expected) => {
      expect(isDomain(input)).toBe(expected);
    });
  });

  describe('domains => valid', () => {
    it.each([
      ['@example.com', true],
      ['@mail.example.com', true],
    ])('isEmailOrDomain(%s) → %s', (input, expected) => {
      expect(isDomain(input)).toBe(expected);
    });
  });

  describe('invalid values', () => {
    it.each([
      ['notanemail', false],
      ['@', false],
      [42, false],
      [null, false],
      [undefined, false],
      [{ email: 'user@example.com' }, false],
      [['user@example.com'], false],
      ['', false],
    ])('isEmailOrDomain(%s) → %s', (input, expected) => {
      expect(isDomain(input)).toBe(expected);
    });
  });
});
