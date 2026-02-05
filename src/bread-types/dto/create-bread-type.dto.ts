import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateBreadTypeDto {
  @ApiProperty({
    description: 'Name of the bread type',
    example: 'Integral',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Description of the bread type',
    example: 'Pan de trigo integral con semillas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
