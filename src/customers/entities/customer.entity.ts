import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { EncryptedTransformer } from '../../common/transformers/encrypted.transformer';

@Entity({ name: 'customers' })
export class Customer {
  @ApiProperty({
    description: 'Unique identifier for the customer',
    example: 'c1234567-89ab-cdef-0123-456789abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Full name of the customer',
    example: 'John Doe',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @ApiProperty({
    description: 'Primary phone number of the customer',
    example: '+1-555-123-4567',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
    transformer: EncryptedTransformer,
  })
  phone: string;

  @ApiProperty({
    description: 'Alternative phone number of the customer',
    example: '+1-555-987-6543',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: EncryptedTransformer,
  })
  alternativePhone?: string;

  @ApiProperty({
    description: 'Email address of the customer',
    example: 'john.doe@example.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email?: string;

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St, Springfield, IL 62704',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @ApiProperty({
    description: 'Alternative address of the customer',
    example: '456 Elm St, Springfield, IL 62705',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  alternativeAddress?: string;

  @ApiProperty({
    description: 'Additional notes about the customer',
    example: 'Prefers evening calls',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Indicates whether the customer is active',
    example: true,
    default: true,
  })
  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Timestamp when the customer was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the customer was updated',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiHideProperty()
  @ManyToOne(() => Order, (order) => order.customer)
  orders: Order[];
}
