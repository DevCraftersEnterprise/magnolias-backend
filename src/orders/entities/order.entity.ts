import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { DeliveryRound } from '../../common/enums/delivery-round.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { EncryptedTransformer } from '../../common/transformers/encrypted.transformer';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderFlower } from '../../flowers/entities/order-flower.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderDetail } from './order-detail.entity';

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
    description: 'Product size for the order',
    example: ProductSize.TWENTY_P,
    required: false,
  })
  @Column({ type: 'enum', enum: ProductSize, nullable: true })
  productSize?: ProductSize;

  @ApiProperty({
    description: 'Custom size for the order (if product size is CUSTOM)',
    example: '80 personas',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  customSize?: string;

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
    description: 'Name of the person who will pick up the order',
    example: 'María García',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  pickupPersonName?: string;

  @ApiProperty({
    description: 'Phone of the person who will pick up the order',
    example: '+52 123 456 7890',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: EncryptedTransformer,
  })
  pickupPersonPhone?: string;

  @ApiProperty({
    description: 'Delivery address (for delivery orders)',
    example: 'Av. Principal 123, Col. Centro',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  deliveryAddress?: string;

  @ApiProperty({
    description: 'Additional delivery notes',
    example: 'Casa verde con portón blanco',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  deliveryNotes?: string;

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
    description: 'Current status of the order',
    example: OrderStatus.IN_PROCESS,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

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
