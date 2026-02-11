import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCustomerAddressDto {
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
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'Postal code of the address.',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiProperty({
    description: 'Interphone code for the address, if applicable.',
    example: '1234#',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  interphoneCode?: string;

  @ApiProperty({
    description: 'Between streets or cross streets, if applicable.',
    example: 'Between 1st Ave and 2nd Ave',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  beetweenStreets?: string;

  @ApiProperty({
    description: 'Reference point for the address, if applicable.',
    example: 'Near the big park',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: 'Additional notes for the address, if applicable.',
    example: 'Leave package at the front door.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
