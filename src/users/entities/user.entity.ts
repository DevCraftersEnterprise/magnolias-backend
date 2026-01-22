import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { UserRoles } from '../enums/user-role';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, nullable: false })
  lastname: string;

  @Column({ length: 255, nullable: false })
  username: string;

  @Column({ length: 255, nullable: false })
  @Exclude()
  userkey: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    array: false,
  })
  role: string;

  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
