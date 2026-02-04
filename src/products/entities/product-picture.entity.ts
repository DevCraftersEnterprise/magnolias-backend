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
import { User } from '../../users/entities/user.entity';

import { Product } from './product.entity';

@Entity({ name: 'product_pictures' })
export class ProductPicture {
  @ApiProperty({
    description: 'Unique identifier of the product picture',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'URL of the product image stored in Cloudinary',
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/product.jpg',
  })
  @Column({ type: 'varchar' })
  imageUrl: string;

  @ApiProperty({
    description: 'Active status of the picture',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'User who created the picture record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who last updated the picture record',
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
    description: 'Product associated with this picture',
    type: () => Product,
  })
  @ManyToOne(() => Product, (product) => product.pictures, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
