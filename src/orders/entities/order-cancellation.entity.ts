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

@Entity({ name: 'orders_cancellations' })
export class OrderCancellation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'varchar' })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'canceledBy' })
  canceledBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  canceledAt: Date;
}
