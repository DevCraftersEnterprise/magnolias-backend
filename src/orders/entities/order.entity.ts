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
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderDetail } from './order-detail.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'orders' })
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the client who placed the order',
    example: 'John Doe',
  })
  @Column({ length: 255, nullable: false })
  clientName: string;

  @ApiProperty({
    description: 'Phone number of the client who placed the order',
    example: '+1-234-567-8900',
  })
  @Column({ length: 255, nullable: false })
  clientPhone: string;

  @ApiProperty({
    description: 'Date when the order is to be delivered',
    example: '2024-12-31T15:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  deliveryDate: Date;

  @ApiProperty({
    description: 'Current status of the order',
    example: OrderStatus.IN_PROCESS,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @ApiProperty({
    description: 'Branch where the order was placed',
    type: () => Branch,
  })
  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ApiProperty({
    description: 'User who created the order',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who updated the order',
    type: () => User,
  })
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

  @ApiProperty({
    description: 'Details associated with the order',
    type: () => [OrderDetail],
  })
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  details: OrderDetail[];
}
