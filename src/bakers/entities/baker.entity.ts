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
import { BakerArea } from '../../common/enums/baker-area.enum';
import { User } from '../../users/entities/user.entity';
import { OrderAssignment } from './order-assignment.entity';

@Entity({ name: 'bakers' })
export class Baker {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Full name of the baker',
    example: 'Carlos Ramírez',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+52 123 456 7890',
  })
  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @ApiProperty({
    description: 'Work area of the baker',
    example: BakerArea.PE,
    enum: BakerArea,
  })
  @Column({ type: 'enum', enum: BakerArea, nullable: false })
  area: BakerArea;

  @ApiProperty({
    description: 'Specialty description',
    example: 'Especialista en pasteles de tres leches',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  specialty?: string;

  @ApiProperty({
    description: 'Indicates if the baker is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'User who created this record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ApiProperty({
    description: 'User who last updated this record',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Order assignments for this baker',
    type: () => [OrderAssignment],
  })
  @OneToMany(() => OrderAssignment, (assignment) => assignment.baker)
  assignments: OrderAssignment[];
}
