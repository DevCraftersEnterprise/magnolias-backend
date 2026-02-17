import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
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
import { EventServiceType } from '../../common/enums/event-service-type.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { PaymentMethod } from '../../common/enums/payment-methods.enum';
import { AddFlowerToOrderDto } from '../../flowers/dto/add-flower-to-order.dto';
import { CreateOrderDeliveryAddressDto } from './create-order-delivery-address.dto';
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

  @ApiPropertyOptional({
    description: 'Delivery round (required for DOM and FLOR orders)',
    example: DeliveryRound.ROUND_1,
    enum: DeliveryRound,
  })
  @ValidateIf((o) =>
    [OrderType.DOMICILIO, OrderType.FLOR].includes(o.orderType),
  )
  @IsNotEmpty({ message: 'Delivery round is required for delivery orders' })
  @IsEnum(DeliveryRound, { message: 'Invalid delivery round' })
  @IsOptional()
  deliveryRound?: DeliveryRound;

  @ApiProperty({
    description: 'Delivery date for the order',
    example: '2023-12-31T23:59:59.000Z',
  })
  @IsNotEmpty({ message: 'Delivery date is required' })
  @Type(() => Date)
  @IsDate({ message: 'deliveryDate must be a valid date' })
  deliveryDate: Date;

  @ApiPropertyOptional({
    description: 'Specific delivery time (HH:MM format)',
    example: '15:30',
  })
  @IsOptional()
  @IsString({ message: 'Delivery time must be a string' })
  deliveryTime?: string;

  @ApiPropertyOptional({
    description: 'Time when the order should be ready (HH:MM format)',
    example: '14:00',
  })
  @IsOptional()
  @IsString({ message: 'Ready time must be a string' })
  readyTime?: string;

  @ApiPropertyOptional({
    description: 'Time of the event (HH:MM format, for event orders)',
    example: '18:00',
  })
  @IsOptional()
  @IsString({ message: 'Event time must be a string' })
  eventTime?: string;

  @ApiPropertyOptional({
    description: 'Setup/assembly time for events (HH:MM format)',
    example: '16:00',
  })
  @IsOptional()
  @IsString({ message: 'Setup time must be a string' })
  setupTime?: string;

  @ApiPropertyOptional({
    description: 'Time of departure from branch (HH:MM format)',
    example: '15:30',
  })
  @IsOptional()
  @IsString({ message: 'Branch departure time must be a string' })
  branchDepartureTime?: string;

  @ApiPropertyOptional({
    description: 'Date and time for collection/pickup',
    example: '2026-02-15T10:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Collection date time must be a valid date' })
  collectionDateTime?: Date;

  @ApiPropertyOptional({
    description: 'Name of the person responsible for setup',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'Setup person name must be a string' })
  @MaxLength(255, {
    message: 'Setup person name must not exceed 255 characters',
  })
  setupPersonName?: string;

  @ApiPropertyOptional({
    description: 'Types of services for the event',
    example: [EventServiceType.DESSERT_TABLE, EventServiceType.CAKE],
    enum: EventServiceType,
    isArray: true,
  })
  @IsOptional()
  @IsArray({ message: 'Event services must be an array' })
  @IsEnum(EventServiceType, {
    each: true,
    message: 'Invalid event service type',
  })
  eventServices?: EventServiceType[];

  @ApiPropertyOptional({
    description: 'Number of guests for the event',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Guest count must be an integer' })
  @Min(1, { message: 'Guest count must be at least 1' })
  guestCount?: number;

  @ApiPropertyOptional({
    description: 'Advance payment amount',
    example: 200.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Advance payment must be a number' })
  @Min(0, { message: 'Advance payment must be at least 0' })
  advancePayment?: number;

  @ApiPropertyOptional({
    description: 'Indicates if the order has a photo reference',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'hasPhotoReference must be a boolean' })
  hasPhotoReference?: boolean;

  @ApiPropertyOptional({
    description: 'Ticket number for advance payment',
    example: 'TKT-2026-001234',
  })
  @IsOptional()
  @IsString({ message: 'Ticket number must be a string' })
  @MaxLength(50, { message: 'Ticket number must not exceed 50 characters' })
  ticketNumber?: string;

  @ApiPropertyOptional({
    description: 'Payment method',
    example: PaymentMethod.CARD,
    enum: PaymentMethod,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Bank account for transfer payments',
    example: 'BBVA 1234567890',
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.TRANSFER)
  @IsString({ message: 'Transfer account must be a string' })
  @MaxLength(255, {
    message: 'Transfer account must not exceed 255 characters',
  })
  @IsOptional()
  transferAccount?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the customer requires an invoice',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiresInvoice must be a boolean' })
  requiresInvoice?: boolean;

  @ApiProperty({
    description: 'Identifier of the branch where the order is placed',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsNotEmpty({ message: 'Branch ID is required' })
  @IsUUID('4', { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @ApiPropertyOptional({
    description:
      'Delivery address information (required for DOM and FLOR orders)',
    type: CreateOrderDeliveryAddressDto,
  })
  @ValidateIf((o) =>
    [OrderType.DOMICILIO, OrderType.FLOR, OrderType.EVENTO].includes(
      o.orderType,
    ),
  )
  @ValidateNested()
  @Type(() => CreateOrderDeliveryAddressDto)
  @IsOptional()
  deliveryAddress?: CreateOrderDeliveryAddressDto;

  @ApiProperty({
    description: 'Details of the order',
    type: [CreateOrderDetailDto],
  })
  @IsArray({ message: 'Details must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  @IsNotEmpty({ message: 'At least one order detail is required' })
  details: CreateOrderDetailDto[];

  @ApiPropertyOptional({
    description: 'Flowers for the order (required for FLOR type)',
    type: [AddFlowerToOrderDto],
  })
  @ValidateIf((o) => o.orderType === OrderType.FLOR)
  @IsArray({ message: 'Flowers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AddFlowerToOrderDto)
  @IsNotEmpty({ message: 'At least one flower is required for FLOR orders' })
  @IsOptional()
  flowers?: AddFlowerToOrderDto[];
}
