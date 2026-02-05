import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseFilePipe implements PipeTransform {
  constructor(
    private readonly options?: {
      maxSize?: number;
      allowedMimeTypes?: string[];
      required?: boolean;
    },
  ) {}

  transform(value: Express.Multer.File): Express.Multer.File {
    if (!value) {
      if (this.options?.required) {
        throw new BadRequestException('File is required');
      }
      return value;
    }

    if (this.options?.maxSize && value.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.options.maxSize} bytes`,
      );
    }

    if (
      this.options?.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(value.mimetype)
    ) {
      throw new BadRequestException(
        `File type ${value.mimetype} is not allowed. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    return value;
  }
}
