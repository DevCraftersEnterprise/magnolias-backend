import { BadRequestException } from '@nestjs/common';

export class FileValidator {
  private static readonly IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  static validateImage(file: Express.Multer.File): void {
    if (!file) return;

    if (!this.IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types are: ${this.IMAGE_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      );
    }
  }

  static validateImages(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) return;

    files.forEach((file) => this.validateImage(file));
  }
}
