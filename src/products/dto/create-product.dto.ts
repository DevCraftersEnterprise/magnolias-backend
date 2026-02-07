import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Chocolate Cake',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'Delicious chocolate cake with ganache',
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'CategoryId of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;
}
