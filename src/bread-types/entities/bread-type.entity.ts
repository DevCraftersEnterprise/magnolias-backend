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

@Entity({ name: 'bread_types' })
export class BreadType {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the bread type',
    example: 'Integral',
  })
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @ApiProperty({
    description: 'Description of the bread type',
    example: 'Pan de trigo integral con semillas',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Indicates if the bread type is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'User who created the bread type',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who updated the bread type',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Timestamp when the bread type was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the bread type was updated',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
