import * as crypto from 'crypto';

const HASH_ENV_VAR = 'PHONE_HASH_SECRET';

const getHashSecret = (): string => {
  const secret = process.env[HASH_ENV_VAR];

  if (!secret) {
    throw new Error(`${HASH_ENV_VAR} environment variable is not set`);
  }

  return secret;
};

/**
 * Normalizes a phone string down to digits only, so equivalent numbers
 * written differently (e.g. "555-123-4567" vs "5551234567") produce the
 * same hash/last-4.
 */
export const normalizePhoneDigits = (phone: string): string => {
  return (phone ?? '').replace(/\D/g, '');
};

/**
 * Deterministic HMAC-SHA256 of a phone number's digits. Unlike
 * `encryption.util.ts`'s `encrypt()` (random IV per call, reversible),
 * this is a one-way "blind index": same input always produces the same
 * output, which restores exact-match lookup and uniqueness at the SQL
 * level without exposing the phone number itself.
 */
export const hashPhone = (phone: string): string => {
  const digits = normalizePhoneDigits(phone);
  return crypto.createHmac('sha256', getHashSecret()).update(digits).digest('hex');
};

/**
 * Last 4 digits of a phone number, stored in plaintext to support a fast
 * additional search by last digits (a deliberate, explicit product
 * trade-off — see the phone-search-fix plan for context).
 */
export const getPhoneLast4 = (phone: string): string => {
  const digits = normalizePhoneDigits(phone);
  return digits.length >= 4 ? digits.slice(-4) : digits;
};

/** Shared helper for Customer create/update usecases. */
export const buildPhoneIndexFields = (
  phone: string,
): { phoneHash: string; phoneLast4: string } => {
  return { phoneHash: hashPhone(phone), phoneLast4: getPhoneLast4(phone) };
};
