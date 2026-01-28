import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'colors' })
export class Color {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 7 })
  value: string;

  @Column({ type: 'varchar' })
  name: string;
}
