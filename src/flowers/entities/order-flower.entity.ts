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
import { Color } from '../../colors/entities/color.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Flower } from './flower.entity';

/**
 * Entidad intermedia para la relación muchos a muchos entre Order y Flower
 * Permite especificar tipo, color y cantidad de cada flor en un pedido
 */
@Entity({ name: 'order_flowers' })
export class OrderFlower {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The order this flower belongs to',
    type: () => Order,
  })
  @ManyToOne(() => Order, (order) => order.orderFlowers, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    description: 'The type of flower',
    type: () => Flower,
  })
  @ManyToOne(() => Flower, (flower) => flower.orderFlowers, {
    nullable: false,
  })
  @JoinColumn({ name: 'flowerId' })
  flower: Flower;

  @ApiProperty({
    description: 'Color of the flower',
    type: () => Color,
    required: false,
  })
  @ManyToOne(() => Color, { nullable: true })
  @JoinColumn({ name: 'colorId' })
  color?: Color;

  @ApiProperty({
    description: 'Quantity of this flower type',
    example: 12,
  })
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'Additional notes about this flower',
    example: 'Colocar en el centro del pastel',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'User who created this record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who last updated this record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
