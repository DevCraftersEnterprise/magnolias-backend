import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { DeliveryRound } from '../../common/enums/delivery-round.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderFlower } from '../../flowers/entities/order-flower.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderDetail } from './order-detail.entity';
import { EventServiceType } from '../../common/enums/event-service-type.enum';
import { PaymentMethod } from '../../common/enums/payment-methods.enum';
import { OrderDeliveryAddress } from './order-delivery-address.entity';
import { EncryptedTransformer } from '../../common/transformers/encrypted.transformer';

@Entity({ name: 'orders' })
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Type of the order',
    example: OrderType.DOMICILIO,
  })
  @Column({ type: 'enum', enum: OrderType, nullable: false })
  orderType: OrderType;

  @ApiProperty({
    description: 'Order code generated based on type and sequence',
    example: 'DOM-2026-0001',
  })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  orderCode: string;

  @ApiProperty({
    description: 'Delivery round for the order',
    example: DeliveryRound.ROUND_1,
    required: false,
  })
  @Column({ type: 'enum', enum: DeliveryRound, nullable: true })
  deliveryRound?: DeliveryRound;

  @ApiProperty({
    description: 'Date when the order is to be delivered',
    example: '2024-12-31T15:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  deliveryDate: Date;

  @ApiProperty({
    description: 'Specific delivery time (optional)',
    example: '15:30',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  deliveryTime?: string;

  @ApiProperty({
    description: 'Time when the order should be ready',
    example: '14:00',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  readyTime?: string;

  @ApiProperty({
    description: 'Time of the event (for event orders)',
    example: '18:00',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  eventTime?: string;

  @ApiProperty({
    description: 'Setup/assembly time for events',
    example: '16:00',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  setupTime?: string;

  @ApiProperty({
    description: 'Time of departure from branch',
    example: '15:30',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  branchDepartureTime?: string;

  @ApiProperty({
    description: 'Date and time for collection/pickup',
    example: '2026-02-15T10:00:00Z',
    required: false,
  })
  @Column({ type: 'timestamptz', nullable: true })
  collectionDateTime?: Date;

  @ApiProperty({
    description: 'Name of the person responsible for setup',
    example: 'Juan Pérez',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  setupPersonName?: string;

  @ApiProperty({
    description: 'Types of services for the event',
    example: [EventServiceType.DESSERT_TABLE, EventServiceType.CAKE],
    enum: EventServiceType,
    isArray: true,
    required: false,
  })
  @Column({ type: 'simple-array', nullable: true })
  eventServices?: EventServiceType[];

  @ApiProperty({
    description: 'Number of guests for the event',
    example: 100,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  guestCount?: number;

  @ApiProperty({
    description: 'Total amount of the order',
    example: 850.0,
  })
  @Column({ type: 'money', default: 0 })
  totalAmount: number;

  @ApiProperty({
    description: 'Amount paid as advance',
    example: 200.0,
  })
  @Column({ type: 'money', default: 0 })
  advancePayment: number;

  @ApiProperty({
    description: 'Remaining balance',
    example: 650.0,
  })
  @Column({ type: 'money', default: 0 })
  remainingBalance: number;

  @ApiProperty({
    description: 'Amount already paid (for vitrina orders)',
    example: 350.0,
  })
  @Column({ type: 'money', default: 0 })
  paidAmount: number;

  @ApiProperty({
    description: 'Total cost for desserts (events)',
    example: 5000.0,
  })
  @Column({ type: 'money', default: 0 })
  dessertsTotal: number;

  @ApiProperty({
    description: 'Cost for setup/assembly service (events)',
    example: 1500.0,
  })
  @Column({ type: 'money', default: 0 })
  setupServiceCost: number;

  @ApiProperty({
    description: 'Indicates if the order has a photo reference',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  hasPhotoReference: boolean;

  @ApiProperty({
    description: 'Ticket number for advance payment',
    example: 'TKT-2026-001234',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ticketNumber?: string;

  @ApiProperty({
    description: 'Ticket number for settlement/final payment',
    example: 'TKT-2026-001235',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  settlementTicketNumber?: string;

  @ApiProperty({
    description: 'Payment method',
    example: PaymentMethod.CARD,
    enum: PaymentMethod,
    required: false,
  })
  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Bank account for transfer payments',
    example: 'BBVA 1234567890',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    transformer: EncryptedTransformer,
  })
  transferAccount?: string;

  @ApiProperty({
    description: 'Indicates if the customer requires an invoice',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  requiresInvoice: boolean;

  @ApiProperty({
    description: 'Date of settlement/final payment',
    example: '2026-02-20T00:00:00Z',
    required: false,
  })
  @Column({ type: 'timestamptz', nullable: true })
  settlementDate?: Date;

  @ApiProperty({
    description: 'Total amount to settle',
    example: 2500.0,
  })
  @Column({ type: 'money', default: 0 })
  settlementTotal: number;

  @ApiProperty({
    description: 'Current status of the order',
    example: OrderStatus.IN_PROCESS,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @ApiHideProperty()
  @OneToOne(() => OrderDeliveryAddress, (address) => address.order, {
    cascade: true,
    eager: false,
  })
  deliveryAddress?: OrderDeliveryAddress;

  @ApiHideProperty()
  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ApiHideProperty()
  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Timestamp when the order was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order was updated',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiHideProperty()
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  details: OrderDetail[];

  @ApiHideProperty()
  @OneToMany(() => OrderFlower, (orderFlower) => orderFlower.order)
  orderFlowers: OrderFlower[];
}
