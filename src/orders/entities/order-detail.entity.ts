import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { Color } from '../../colors/entities/color.entity';
import { PipingLocation } from '../../common/enums/piping-location.enum';
import { WritingLocation } from '../../common/enums/writing-location.enum';
import { Filling } from '../../fillings/entities/filling.entity';
import { Flavor } from '../../flavors/entities/flavor.entity';
import { Frosting } from '../../frostings/entities/frosting.entity';
import { Product } from '../../products/entities/product.entity';
import { Style } from '../../styles/entities/style.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_details' })
export class OrderDetail {
  @ApiProperty({
    description: 'Unique identifier for the order detail',
    example: 'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Price of the product at the time of order',
    example: 29.99,
  })
  @Column({ type: 'money', default: 0 })
  price: number;

  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
  })
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'Indicates if the item has writing',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  hasWriting: boolean;

  @ApiProperty({
    description: 'Text to be written on the product',
    example: 'Feliz Cumpleaños María',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  writingText?: string;

  @ApiProperty({
    description: 'Location where the writing should be placed',
    example: WritingLocation.TOP,
    enum: WritingLocation,
    required: false,
  })
  @Column({ type: 'enum', enum: WritingLocation, nullable: true })
  writingLocation?: WritingLocation;

  @ApiProperty({
    description: 'Location of piping (decorative frosting)',
    example: PipingLocation.TOP_BORDER,
    enum: PipingLocation,
    required: false,
  })
  @Column({ type: 'enum', enum: PipingLocation, nullable: true })
  pipingLocation?: PipingLocation;

  @ApiProperty({
    description: 'Additional notes for the order detail',
    example: 'Please gift wrap this item.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Reference image URL for the order detail',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  referenceImageUrl?: string;

  @ApiProperty({
    description: 'Indicates if the order detail is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'The product associated with this order detail',
    type: () => Product,
  })
  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({
    description: 'The order associated with this order detail',
    type: () => Order,
  })
  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    description: 'The color associated with this order detail, if any',
    type: () => Color,
    required: false,
  })
  @ManyToOne(() => Color, { nullable: true })
  @JoinColumn({ name: 'colorId' })
  color?: Color;

  @ApiProperty({
    description: 'Type of bread for this item',
    type: () => BreadType,
    required: false,
  })
  @ManyToOne(() => BreadType, { nullable: true })
  @JoinColumn({ name: 'breadTypeId' })
  breadType?: BreadType;

  @ApiProperty({
    description: 'Filling for this item',
    type: () => Filling,
    required: false,
  })
  @ManyToOne(() => Filling, { nullable: true })
  @JoinColumn({ name: 'fillingId' })
  filling?: Filling;

  @ApiProperty({
    description: 'Flavor for this item',
    type: () => Flavor,
    required: false,
  })
  @ManyToOne(() => Flavor, { nullable: true })
  @JoinColumn({ name: 'flavorId' })
  flavor?: Flavor;

  @ApiProperty({
    description: 'Frosting type for this item',
    type: () => Frosting,
    required: false,
  })
  @ManyToOne(() => Frosting, { nullable: true })
  @JoinColumn({ name: 'frostingId' })
  frosting?: Frosting;

  @ApiProperty({
    description: 'Style for this item',
    type: () => Style,
    required: false,
  })
  @ManyToOne(() => Style, { nullable: true })
  @JoinColumn({ name: 'styleId' })
  style?: Style;

  @ApiProperty({
    description: 'User who created the order detail',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who updated the order detail',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Timestamp when the order detail was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order detail was updated',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
