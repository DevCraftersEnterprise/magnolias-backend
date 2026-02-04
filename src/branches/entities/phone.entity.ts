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
import { Branch } from './branch.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'phones' })
export class Phone {
  @ApiProperty({
    description: 'Unique identifier for the phone record',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Primary phone number',
    example: '5551112222',
  })
  @Column({ name: 'phone1', type: 'text', nullable: false })
  phone1: string;

  @ApiProperty({
    description: 'Secondary phone number',
    example: '5553334444',
    nullable: true,
  })
  @Column({ name: 'phone2', type: 'text', nullable: true })
  phone2?: string;

  @ApiProperty({
    description: 'WhatsApp phone number',
    example: '5555556666',
    nullable: true,
  })
  @Column({ name: 'whatsapp', type: 'text', nullable: true })
  whatsapp?: string;

  @ApiProperty({
    description: 'Associated branch for the phone record',
    type: () => Branch,
  })
  @OneToOne(() => Branch, (branch) => branch.phones, {
    nullable: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ApiProperty({
    description: 'User who created the phone record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who updated the phone record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Timestamp when the phone record was created',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the phone record was updated',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
