import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommonAddressDto {
  @ApiProperty({
    description: 'Name of the address, e.g., Home, Work, etc.',
    example: 'Salon de fiestas La Esquina',
  })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Street name of the address.',
    example: 'Av. Siempre Viva',
  })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty({
    description: 'Number of the address.',
    example: '123-A',
  })
  @IsString()
  @MaxLength(50)
  number: string;

  @ApiProperty({
    description: 'Neighborhood or district of the address.',
    example: 'Springfield',
  })
  @IsString()
  @MaxLength(255)
  neighborhood: string;

  @ApiProperty({
    description: 'City of the address.',
    example: 'Springfield',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'Postal code of the address.',
    example: '12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiProperty({
    description: 'Interphone code for the address, if applicable.',
    example: '1234#',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  interphoneCode?: string;

  @ApiProperty({
    description: 'Between streets or cross streets, if applicable.',
    example: 'Between 1st Ave and 2nd Ave',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  betweenStreets?: string;

  @ApiProperty({
    description: 'Reference point for the address, if applicable.',
    example: 'Near the big park',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: 'Additional notes for the address, if applicable.',
    example: 'Leave package at the front door.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
