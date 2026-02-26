import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID, Min } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Payment amount for the order',
    example: 500,
  })
  @IsOptional()
  @Min(1, { message: 'Payment amount must be at least 1' })
  payment?: number;
}
