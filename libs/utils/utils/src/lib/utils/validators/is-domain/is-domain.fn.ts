import { isEmail } from 'class-validator';

/** must start with @ and be a valid email format after the @ */
export function isDomain(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.charAt(0) !== '@') return false;
  if (isEmail('a' + value)) return true;
  return false;
}
