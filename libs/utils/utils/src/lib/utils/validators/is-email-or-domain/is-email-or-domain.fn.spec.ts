import { describe, expect, it } from 'vitest';
import { isEmailOrDomain } from './is-email-or-domain.fn';

describe('isEmailOrDomain', () => {
  describe('valid emails', () => {
    it.each([
      ['user@example.com', true],
      ['user@mail.example.com', true],
    ])('isEmailOrDomain(%s) → %s', (input, expected) => {
      expect(isEmailOrDomain(input)).toBe(expected);
    });
  });

  describe('valid domains', () => {
    it.each([
      ['@example.com', true],
      ['@mail.example.com', true],
    ])('isEmailOrDomain(%s) → %s', (input, expected) => {
      expect(isEmailOrDomain(input)).toBe(expected);
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
      expect(isEmailOrDomain(input)).toBe(expected);
    });
  });
});
