import { IsArray, IsDate, IsNotEmpty } from 'class-validator';
import { CreateOrderDetailDto } from './create-order-detail.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Name of the client placing the order',
    example: 'John Doe',
  })
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({
    description: 'Phone number of the client placing the order',
    example: '1234567890',
  })
  @IsNotEmpty()
  clientPhone: string;

  @ApiProperty({
    description: 'Delivery date for the order',
    example: '2023-12-31T23:59:59.000Z',
  })
  @IsNotEmpty()
  @IsDate({ message: 'deliveryDate must be a valid date' })
  deliveryDate: Date;

  @ApiProperty({
    description: 'Identifier of the branch where the order is placed',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'Details of the order',
    type: [CreateOrderDetailDto],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  details: CreateOrderDetailDto[];
}
