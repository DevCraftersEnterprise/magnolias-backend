import { IsArray, IsDate, IsNotEmpty } from 'class-validator';
import { CreateOrderDetailDto } from './create-order-detail.dto';

export class CreateOrderDto {
  @IsNotEmpty()
  clientName: string;

  @IsNotEmpty()
  clientPhone: string;

  @IsNotEmpty()
  @IsDate({ message: 'deliveryDate must be a valid date' })
  deliveryDate: Date;

  @IsNotEmpty()
  branchId: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  details: CreateOrderDetailDto[];
}
