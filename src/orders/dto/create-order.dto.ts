import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DeliveryRound } from '../../common/enums/delivery-round.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { AddFlowerToOrderDto } from '../../flowers/dto/add-flower-to-order.dto';
import { CreateOrderDetailDto } from './create-order-detail.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Type of order',
    example: OrderType.DOMICILIO,
    enum: OrderType,
  })
  @IsNotEmpty({ message: 'Order type is required' })
  @IsEnum(OrderType, { message: 'Invalid order type' })
  orderType: OrderType;

  @ApiProperty({
    description: 'ID of the customer placing the order',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsNotEmpty({ message: 'Customer ID is required' })
  @IsUUID('4', { message: 'Customer ID must be a valid UUID' })
  customerId: string;

  @ApiProperty({
    description: 'Delivery round (required for DOM and FLOR orders)',
    example: DeliveryRound.ROUND_1,
    enum: DeliveryRound,
    required: false,
  })
  @ValidateIf((o) =>
    [OrderType.DOMICILIO, OrderType.FLOR].includes(o.orderType),
  )
  @IsNotEmpty({ message: 'Delivery round is required for delivery orders' })
  @IsEnum(DeliveryRound, { message: 'Invalid delivery round' })
  @IsOptional()
  deliveryRound?: DeliveryRound;

  @ApiProperty({
    description: 'Product size',
    example: ProductSize.TWENTY_P,
    enum: ProductSize,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductSize, { message: 'Invalid product size' })
  productSize?: ProductSize;

  @ApiProperty({
    description: 'Custom size (required if productSize is CUSTOM)',
    example: '35 personas',
    required: false,
  })
  @ValidateIf((o) => o.productSize === ProductSize.CUSTOM)
  @IsNotEmpty({ message: 'Custom size is required when size is CUSTOM' })
  @IsString({ message: 'Custom size must be a string' })
  @MaxLength(100)
  @IsOptional()
  customSize?: string;

  @ApiProperty({
    description: 'Delivery date for the order',
    example: '2023-12-31T23:59:59.000Z',
  })
  @IsNotEmpty({ message: 'Delivery date is required' })
  @Type(() => Date)
  @IsDate({ message: 'deliveryDate must be a valid date' })
  deliveryDate: Date;

  @ApiProperty({
    description: 'Specific delivery time (HH:MM format)',
    example: '15:30',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Delivery time must be a string' })
  deliveryTime?: string;

  @ApiProperty({
    description:
      'Delivery address (required for DOM and FLOR if not using customer default)',
    example: 'Av. Principal 123, Col. Centro',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Delivery address must be a string' })
  deliveryAddress?: string;

  @ApiProperty({
    description: 'Delivery notes',
    example: 'Casa verde con portón blanco',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Delivery notes must be a string' })
  deliveryNotes?: string;

  @ApiProperty({
    description: 'Advance payment amount',
    example: 200.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Advance payment must be a number' })
  @Min(0, { message: 'Advance payment must be at least 0' })
  advancePayment?: number;

  @ApiProperty({
    description: 'Identifier of the branch where the order is placed',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsNotEmpty({ message: 'Branch ID is required' })
  @IsUUID('4', { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @ApiProperty({
    description: 'Details of the order',
    type: [CreateOrderDetailDto],
  })
  @IsArray({ message: 'Details must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  @IsNotEmpty({ message: 'At least one order detail is required' })
  details: CreateOrderDetailDto[];

  @ApiProperty({
    description: 'Flowers for the order (required for FLOR type)',
    type: [AddFlowerToOrderDto],
    required: false,
  })
  @ValidateIf((o) => o.orderType === OrderType.FLOR)
  @IsArray({ message: 'Flowers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AddFlowerToOrderDto)
  @IsNotEmpty({ message: 'At least one flower is required for FLOR orders' })
  @IsOptional()
  flowers?: AddFlowerToOrderDto[];
}
