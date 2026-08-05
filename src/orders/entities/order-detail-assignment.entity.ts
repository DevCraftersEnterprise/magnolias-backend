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
import { OrderDetail } from './order-detail.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'order_detail_assignments' })
export class OrderDetailAssignment {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'bakerId' })
  baker: User;

  @ApiHideProperty()
  @ManyToOne(() => OrderDetail, (detail) => detail.assignments, {
    nullable: false,
  })
  @JoinColumn({ name: 'orderDetailId' })
  orderDetail: OrderDetail;

  @ApiProperty({
    description: 'Date the assignment was made',
    example: '2023-01-01T12:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  assignedDate: Date;

  @ApiProperty({
    description: 'Notes about the assignment',
    example: 'Prioridad alta - entrega mañana',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiHideProperty()
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
