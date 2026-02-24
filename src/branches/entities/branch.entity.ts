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
import { Phone } from './phone.entity';
import { Expose } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'branches' })
export class Branch {
  @ApiProperty({
    description: 'Unique identifier for the branch',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the branch',
    example: 'Downtown Branch',
  })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiProperty({
    description: 'Address of the branch',
    example: '123 Main St, Cityville',
  })
  @Column({ length: 255, nullable: false })
  address: string;

  @ApiProperty({
    description: 'Indicates whether the branch is active',
    example: true,
    default: true,
  })
  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @ApiHideProperty()
  @OneToOne(() => Phone, (phone) => phone.branch, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'phoneId' })
  @Expose()
  phones: Phone;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Timestamp when the branch was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the branch was updated',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
