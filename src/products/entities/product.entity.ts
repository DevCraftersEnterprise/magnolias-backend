import { ApiProperty } from '@nestjs/swagger';
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
import { User } from '../../users/entities/user.entity';

import { ProductPicture } from './product-picture.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Chocolate Cake',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'Delicious chocolate cake with ganache',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Active status of the product',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'User who created the product',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who last updated the product',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Product pictures',
    type: () => [ProductPicture],
  })
  @OneToMany(() => ProductPicture, (picture) => picture.product)
  pictures: ProductPicture[];
}
