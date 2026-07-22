import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
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
    description:
      'Exact delivery date to filter by (matches the whole UTC calendar day). Cannot be combined with startDate/endDate.',
    example: '2023-10-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'orderDate must be a valid date' })
  orderDate?: Date;

  @ApiProperty({
    description:
      'Start date to filter by (inclusive, UTC calendar day). Must be provided together with endDate.',
    example: '2023-10-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid date' })
  startDate?: Date;

  @ApiProperty({
    description:
      'End date to filter by (inclusive, UTC calendar day). Must be provided together with startDate.',
    example: '2023-10-18',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid date' })
  endDate?: Date;
}
