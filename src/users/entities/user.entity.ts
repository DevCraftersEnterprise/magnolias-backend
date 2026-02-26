import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { BakerArea } from '../../common/enums/baker-area.enum';
import { OrderAssignment } from '../../orders/entities/order-assignment.entity';
import { UserRoles } from '../enums/user-role';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @Column({ length: 255, nullable: false })
  lastname: string;

  @ApiProperty({
    description: 'Unique username for authentication',
    example: 'johndoe',
  })
  @Column({ length: 255, nullable: false })
  username: string;

  @ApiProperty({
    description: 'Hashed user password',
    example: '$argon2id$v=19$m=65536,t=3,p=4$...',
  })
  @Column({ length: 255, nullable: false })
  @Exclude()
  userkey: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: UserRoles,
    example: UserRoles.EMPLOYEE,
  })
  @Column({
    type: 'enum',
    enum: UserRoles,
    array: false,
  })
  role: UserRoles;

  @ApiProperty({
    description: 'Active status of the user',
    example: true,
  })
  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @ApiHideProperty()
  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ApiHideProperty()
  @ManyToMany(() => Branch, { nullable: true })
  @JoinTable({
    name: 'baker_branches',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'branchId', referencedColumnName: 'id' },
  })
  branches?: Branch[];

  @ApiProperty({ description: 'Work area of the baker', enum: BakerArea, required: false })
  @Column({ type: 'enum', enum: BakerArea, nullable: true })
  area?: BakerArea;

  @ApiProperty({ description: 'Specialty description', required: false })
  @Column({ type: 'text', nullable: true })
  specialty?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  // Relación con asignaciones de órdenes
  @ApiHideProperty()
  @OneToMany(() => OrderAssignment, (assignment) => assignment.baker)
  assignments?: OrderAssignment[];

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
}
