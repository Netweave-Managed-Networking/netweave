import { isEmail } from 'class-validator';

export function isEmailOrDomain(value: unknown): boolean {
  if (isEmail(value)) return true;
  if (typeof value !== 'string') return false;
  if (value.charAt(0) === '@' && isEmail('a' + value)) return true;
  return false;
}
