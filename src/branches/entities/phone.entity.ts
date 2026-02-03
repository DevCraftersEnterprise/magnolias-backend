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

@Entity({ name: 'phones' })
export class Phone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'phone1', type: 'text', nullable: false })
  phone1: string;

  @Column({ name: 'phone2', type: 'text', nullable: true })
  phone2?: string;

  @Column({ name: 'whatsapp', type: 'text', nullable: true })
  whatsapp?: string;

  @OneToOne(() => Branch, (branch) => branch.phones, {
    nullable: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
