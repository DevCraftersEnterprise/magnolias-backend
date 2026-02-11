// src/orders/entities/order-delivery-address.entity.ts
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonAddress } from '../../addresses/entities/common-address.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_delivery_addresses' })
export class OrderDeliveryAddress {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Street name',
    example: 'Av. Revolución',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  street: string;

  @ApiProperty({
    description: 'Street number',
    example: '123-A',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  number: string;

  @ApiProperty({
    description: 'Neighborhood/Colony',
    example: 'Col. Centro',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  neighborhood: string;

  @ApiProperty({
    description: 'City',
    example: 'Guadalajara',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @ApiProperty({
    description: 'Postal code',
    example: '44100',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  postalCode?: string;

  @ApiProperty({
    description: 'Interphone code',
    example: '1234#',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  interphoneCode?: string;

  @ApiProperty({
    description: 'Cross streets',
    example: 'Entre Calle 5 y Calle 7',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  betweenStreets?: string;

  @ApiProperty({
    description: 'Reference',
    example: 'Casa azul con portón negro',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reference?: string;

  @ApiProperty({
    description: 'Delivery notes specific to this order',
    example: 'Entregar antes de las 3pm',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  deliveryNotes?: string;

  @ApiProperty({
    description: 'Name of person receiving the order',
    example: 'María García',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  receiverName?: string;

  @ApiProperty({
    description: 'Phone of person receiving the order',
    example: '+52 333 123 4567',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  receiverPhone?: string;

  @ApiHideProperty()
  @ManyToOne(() => CommonAddress, { nullable: true })
  @JoinColumn({ name: 'commonAddressId' })
  commonAddress?: CommonAddress;

  @ApiHideProperty()
  @OneToOne(() => Order, (order) => order.deliveryAddress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    description: 'Timestamp when the delivery address was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
