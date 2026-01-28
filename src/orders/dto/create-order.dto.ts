import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @IsNotEmpty()
  clientName: string;

  @IsNotEmpty()
  clientPhone: string;

  @IsNotEmpty()
  @IsDate({ message: 'deliveryDate must be a valid date' })
  deliveryDate: Date;

  @IsNotEmpty()
  @IsEnum(OrderStatus, {
    message: 'order status must be a valid OrderStatus value',
  })
  status: OrderStatus;

  @IsNotEmpty()
  branchId: string;
}
