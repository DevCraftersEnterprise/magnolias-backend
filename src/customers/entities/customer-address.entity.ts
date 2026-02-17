import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from './customer.entity';

@Entity({ name: 'customer_addresses' })
export class CustomerAddress {
  @ApiProperty({
    description: 'Unique identifier for the customer address',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Street name of the customer address',
    example: 'Av. Insurgentes Sur',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  street: string;

  @ApiProperty({
    description: 'Number or identifier for the customer address',
    example: '123-A',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  number: string;

  @ApiProperty({
    description: 'Neighborhood or district of the customer address',
    example: 'Colonia Roma',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  neighborhood: string;

  @ApiProperty({
    description: 'City of the customer address',
    example: 'Mexico City',
    required: false,
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  city?: string;

  @ApiProperty({
    description: 'Postal code of the customer address',
    example: '06100',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  postalCode?: string;

  @ApiProperty({
    description: 'Interphone code of the customer address',
    example: '123#',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  interphoneCode?: string;

  @ApiProperty({
    description: 'Between streets of the customer address',
    example: 'Av. Insurgentes Sur and Av. Revolución',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  betweenStreets?: string;

  @ApiProperty({
    description: 'Reference or additional information for the customer address',
    example: 'Near the central park',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reference?: string;

  @ApiProperty({
    description: 'Additional notes for the customer address',
    example: 'This address is frequently used for events.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiHideProperty()
  @OneToOne(() => Customer, (customer) => customer.address, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

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
    example: '2026-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
