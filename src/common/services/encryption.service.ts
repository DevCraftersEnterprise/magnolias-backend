import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private keyPromise: Promise<Buffer>;

  constructor(private configService: ConfigService) {
    const password = configService.get<string>('ENCRYPTION_KEY');

    if (!password) {
      throw new Error('ENCRYPTION_KEY is not set in the configuration');
    }

    this.keyPromise = (promisify(scrypt) as any)(
      password,
      'salt',
      32,
    ) as Promise<Buffer>;
  }

  async encrypt(text: string): Promise<string> {
    try {
      const key = await this.keyPromise;
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    try {
      const key = await this.keyPromise;
      const parts = encryptedText.split(':');

      if (parts.length !== 3) throw new Error('Invalid encrypted text format');

      const [ivHex, authTagHex, encrypted] = parts;

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }
}
