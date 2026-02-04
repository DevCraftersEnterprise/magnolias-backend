import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

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
}
