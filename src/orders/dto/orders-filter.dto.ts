import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class OrdersFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Client name to filter by',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Client phone number to filter by',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  clientPhone?: string;

  @ApiProperty({
    description: 'Order status to filter by',
    example: OrderStatus.DONE,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Order status must be a valid OrderStatus' })
  orderStatus?: OrderStatus;

  @ApiProperty({
    description: 'Delivery date to filter by',
    example: '2023-10-15',
    required: false,
  })
  @IsOptional()
  orderDate?: Date;
}
