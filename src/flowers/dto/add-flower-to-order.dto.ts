import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';

export class AddFlowerToOrderDto {
  @ApiProperty({
    description: 'ID of the flower type',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({ message: 'Flower ID is required' })
  @IsUUID('4', { message: 'Flower ID must be a valid UUID' })
  flowerId: string;

  @ApiProperty({
    description: 'ID of the color',
    example: 'b2c3d4e5-f6g7-8901-bcde-fg1234567890',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Color ID must be a valid UUID' })
  colorId?: string;

  @ApiProperty({
    description: 'Quantity of flowers',
    example: 12,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Colocar en el centro del pastel',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
