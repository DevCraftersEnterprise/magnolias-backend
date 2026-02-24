import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../../users/entities/user.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'orders_cancellations' })
export class OrderCancellation {
  @ApiProperty({
    description: 'Unique identifier for the order cancellation',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    description: 'Reason for the order cancellation',
    example: 'Customer requested cancellation due to change of plans.',
  })
  @Column({ type: 'varchar' })
  description: string;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'canceledBy' })
  canceledBy: User;

  @ApiProperty({
    description: 'Timestamp when the order was canceled',
    example: '2023-10-05T14:48:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  canceledAt: Date;
}
