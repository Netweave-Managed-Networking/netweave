import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_SALT = 'netweave-mail-config';

/**
 * derives an encryption key from JWT_SECRET rather than requiring a dedicated
 * secret env var, mirroring this app's minimal-config style. as a side effect,
 * rotating JWT_SECRET makes previously stored mail passwords undecryptable,
 * same as it already invalidates existing sessions.
 */
function deriveKey(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET must be set to encrypt/decrypt mail config secrets',
    );
  }

  return scryptSync(secret, KEY_SALT, 32);
}

/** stores the result as `iv:authTag:cipherText`, each part hex-encoded */
export function encryptSecret(plainText: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map((buf) => buf.toString('hex')).join(':');
}

export function decryptSecret(cipherText: string): string {
  const [ivHex, authTagHex, encryptedHex] = cipherText.split(':');
  const key = deriveKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
