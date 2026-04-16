import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from '../enums/order-status.enum';

export class OrdersRangeFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Order status to filter by',
    example: OrderStatus.DONE,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Order status must be a valid OrderStatus' })
  orderStatus?: OrderStatus;

  @ApiProperty({
    description: 'Start date to filter by (inclusive)',
    example: '2023-10-15',
    required: false,
  })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date to filter by (inclusive)',
    example: '2023-10-18',
    required: false,
  })
  @IsOptional()
  endDate?: Date;
}
