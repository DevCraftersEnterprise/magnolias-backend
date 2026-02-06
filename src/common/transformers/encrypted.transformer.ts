import { ValueTransformer } from 'typeorm';
import { decrypt, encrypt } from '../utils/encryption.util';

export const EncryptedTransformer: ValueTransformer = {
  to: (value: string | null | undefined): string | null => {
    if (value === null || value === undefined) return null;
    return encrypt(value);
  },

  from: (value: string | null | undefined): string | null => {
    if (value === null || value === undefined) return null;
    return decrypt(value);
  },
};
