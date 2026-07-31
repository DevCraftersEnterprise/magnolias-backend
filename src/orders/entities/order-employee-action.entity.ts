import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BranchEmployee } from '../../branch-employees/entities/branch-employee.entity';
import { OrderEmployeeActionType } from '../enums/order-employee-action-type.enum';
import { Order } from './order.entity';

@Entity({ name: 'order_employee_actions' })
export class OrderEmployeeAction {
  @ApiProperty({
    description: 'Unique identifier for the order employee action',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Type of action performed on the order',
    example: OrderEmployeeActionType.CREATED,
    enum: OrderEmployeeActionType,
  })
  @Column({ type: 'enum', enum: OrderEmployeeActionType })
  action: OrderEmployeeActionType;

  @ApiHideProperty()
  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiHideProperty()
  @ManyToOne(() => BranchEmployee, { nullable: false })
  @JoinColumn({ name: 'employeeId' })
  employee: BranchEmployee;

  @ApiProperty({
    description: 'Timestamp when the action was performed',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  performedAt: Date;
}
