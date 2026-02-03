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
import { Expose } from 'class-transformer';

@Entity({ name: 'phones' })
export class Phone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'phone1_encrypted', type: 'text', nullable: false })
  phone1Encrypted: string;

  @Column({ name: 'phone2_encrypted', type: 'text', nullable: true })
  phone2Encrypted?: string;

  @Column({ name: 'whatsapp_encrypted', type: 'text', nullable: true })
  whatsappEncrypted?: string;

  @Expose()
  phone1?: string;

  @Expose()
  phone2?: string;

  @Expose()
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
