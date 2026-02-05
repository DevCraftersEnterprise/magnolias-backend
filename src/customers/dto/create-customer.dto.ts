import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Full name of the customer',
    example: 'John Doe',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  fullName: string;

  @ApiProperty({
    description: 'Primary phone number of the customer',
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
    description: 'Secondary phone number (optional)',
    example: '+52 098 765 4321',
    required: false,
    minLength: 10,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Alternative phone must be a string' })
  @MinLength(10, {
    message: 'Alternative phone must be at least 10 characters',
  })
  @MaxLength(20, {
    message: 'Alternative phone must not exceed 20 characters',
  })
  alternativePhone?: string;

  @ApiProperty({
    description: 'Email address (optional)',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Primary delivery address',
    example: 'Av. Principal 123, Col. Centro, CP 12345',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiProperty({
    description: 'Additional delivery address (optional)',
    example: 'Calle Secundaria 456, Col. Norte, CP 54321',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Alternative address must be a string' })
  alternativeAddress?: string;

  @ApiProperty({
    description: 'Additional notes about the customer',
    example: 'Cliente frecuente, prefiere entregas matutinas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
