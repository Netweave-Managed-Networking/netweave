import { createHash } from 'crypto';

/** sha256 of a token from a mailed link, so a leaked db row cannot be used in its place */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
