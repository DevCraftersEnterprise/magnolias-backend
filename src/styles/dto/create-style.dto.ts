import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateStyleDto {
  @ApiProperty({
    description: 'Name of the style',
    example: 'Smooth',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Description of the style',
    example: 'Beautifully smooth style',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
