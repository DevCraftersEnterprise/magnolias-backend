import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = (keyEnvVar = 'ENCRYPTION_KEY'): Buffer => {
  const key = process.env[keyEnvVar];

  if (!key) {
    throw new Error(`${keyEnvVar} environment variable is not set`);
  }

  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypts a plain text string.
 * @param plainText - The text to encrypt
 * @param keyEnvVar - Environment variable name for the key (default: ENCRYPTION_KEY)
 * @returns The encrypted text in format: iv:authTag:encryptedData (all in hex)
 */
export const encrypt = (
  plainText: string,
  keyEnvVar = 'ENCRYPTION_KEY',
): string => {
  if (!plainText) return plainText;

  const key = getEncryptionKey(keyEnvVar);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an encrypted string.
 * @param encryptedText - The encrypted text in format: iv:authTag:encryptedData
 * @param keyEnvVar - Environment variable name for the key (default: ENCRYPTION_KEY)
 * @returns The decrypted plain text
 */
export const decrypt = (
  encryptedText: string,
  keyEnvVar = 'ENCRYPTION_KEY',
): string => {
  if (!encryptedText) return encryptedText;

  if (!isEncrypted(encryptedText)) {
    return encryptedText;
  }

  const key = getEncryptionKey(keyEnvVar);
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Checks if a string is encrypted (matches our encryption format).
 * @param text - The text to check
 * @returns True if the text appears to be encrypted
 */
export const isEncrypted = (text: string): boolean => {
  if (!text) return false;

  const parts = text.split(':');
  if (parts.length !== 3) return false;

  const [ivHex, authTagHex] = parts;

  const isValidHex = (hex: string, expectedLength: number) =>
    hex.length === expectedLength && /^[0-9a-fA-F]+$/.test(hex);

  return (
    isValidHex(ivHex, IV_LENGTH * 2) &&
    isValidHex(authTagHex, AUTH_TAG_LENGTH * 2)
  );
};

/**
 * Re-encrypts data from old key to new key.
 * Used during key rotation.
 * @param encryptedText - Text encrypted with old key
 * @param oldKeyEnvVar - Environment variable for old key
 * @param newKeyEnvVar - Environment variable for new key
 * @returns Text encrypted with new key
 */
export const reEncrypt = (
  encryptedText: string,
  oldKeyEnvVar: string,
  newKeyEnvVar: string,
): string => {
  if (!encryptedText) return encryptedText;

  const decrypted = decrypt(encryptedText, oldKeyEnvVar);
  return encrypt(decrypted, newKeyEnvVar);
};

/**
 * Generates a secure random encryption key.
 * @returns A 64-character hex string (32 bytes)
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
