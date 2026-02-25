import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BakerArea } from '../../common/enums/baker-area.enum';

export class CreateBakerDto {
  @ApiProperty({
    description: 'Full name of the baker',
    example: 'Carlos Ramírez',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  fullName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+52 123 456 7890',
    minLength: 10,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @MinLength(10, { message: 'Phone number must be at least 10 characters' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phone: string;

  @ApiProperty({
    description: 'Work area',
    example: BakerArea.PE,
    enum: BakerArea,
  })
  @IsNotEmpty({ message: 'Area is required' })
  @IsEnum(BakerArea, { message: 'Invalid area' })
  area: BakerArea;

  @ApiProperty({
    description: 'Specialty description',
    example: 'Especialista en pasteles de tres leches',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Specialty must be a string' })
  specialty?: string;
}
