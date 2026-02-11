import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
import { ProductSize } from '../../common/enums/product-size.enum';
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
    description: 'Product size for this detail',
    example: ProductSize.TWENTY_P,
    required: false,
  })
  @Column({ type: 'enum', enum: ProductSize, nullable: true })
  productSize?: ProductSize;

  @ApiProperty({
    description: 'Custom size (if product size is CUSTOM)',
    example: '80 personas',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  customSize?: string;

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

  @ApiHideProperty()
  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiHideProperty()
  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiHideProperty()
  @ManyToOne(() => Color, { nullable: true })
  @JoinColumn({ name: 'colorId' })
  color?: Color;

  @ApiHideProperty()
  @ManyToOne(() => BreadType, { nullable: true })
  @JoinColumn({ name: 'breadTypeId' })
  breadType?: BreadType;

  @ApiHideProperty()
  @ManyToOne(() => Filling, { nullable: true })
  @JoinColumn({ name: 'fillingId' })
  filling?: Filling;

  @ApiHideProperty()
  @ManyToOne(() => Flavor, { nullable: true })
  @JoinColumn({ name: 'flavorId' })
  flavor?: Flavor;

  @ApiHideProperty()
  @ManyToOne(() => Frosting, { nullable: true })
  @JoinColumn({ name: 'frostingId' })
  frosting?: Frosting;

  @ApiHideProperty()
  @ManyToOne(() => Style, { nullable: true })
  @JoinColumn({ name: 'styleId' })
  style?: Style;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiHideProperty()
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
