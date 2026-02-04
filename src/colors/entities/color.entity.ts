import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'colors' })
export class Color {
  @ApiProperty({
    description: 'Unique identifier for the color',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Hexadecimal value of the color',
    example: '#FF5733',
  })
  @Column({ type: 'varchar', length: 7 })
  value: string;

  @ApiProperty({
    description: 'Name of the color',
    example: 'Vibrant Orange',
  })
  @Column({ type: 'varchar' })
  name: string;
}
