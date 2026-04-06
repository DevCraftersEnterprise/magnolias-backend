import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseCatalogEntity {
    @ApiProperty({
        description: 'Unique identifier',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Name of the item',
        example: 'Chocolate',
    })
    @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
    name: string;

    @ApiProperty({
        description: 'Description of the item',
        example: 'Delicious chocolate flavor',
        required: false,
    })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty({
        description: 'Indicates if the item is active',
        example: true,
    })
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @ApiHideProperty()
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;

    @ApiHideProperty()
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'updatedBy' })
    updatedBy: User;

    @ApiProperty({
        description: 'Timestamp when the item was created',
        example: '2023-01-01T12:00:00Z',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the item was updated',
        example: '2023-01-01T12:00:00Z',
    })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}