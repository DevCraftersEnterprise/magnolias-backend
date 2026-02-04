import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, Min } from 'class-validator';

export class CreateOrderDetailDto {
  @ApiProperty({
    description: 'Price of the product at the time of order',
    example: 29.99,
  })
  @Min(1)
  price: number;

  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
  })
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unique identifier of the product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Unique identifier of the color (optional)',
    example: 'f1g2h3i4-j5k6-l7m8-n9o0-p1q2r3s4t5u6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  colorId?: string;

  @ApiProperty({
    description: 'Additional notes for the order detail (optional)',
    example: 'Please gift wrap this item.',
    required: false,
  })
  @IsOptional()
  notes?: string;
}
