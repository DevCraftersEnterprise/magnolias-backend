import { randomInt } from 'crypto';

/** Generates a random 4-digit numeric PIN, e.g. "0483". */
export function generateRandomPin(): string {
  return String(randomInt(1000, 10000));
}
