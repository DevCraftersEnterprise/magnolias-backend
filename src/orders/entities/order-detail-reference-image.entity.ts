import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderDetail } from './order-detail.entity';

@Entity({ name: 'order_detail_reference_images' })
export class OrderDetailReferenceImage {
    @ApiProperty({
        description: 'Unique identifier of the reference image',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'URL of the reference image stored in Cloudinary',
        example:
            'https://res.cloudinary.com/example/image/upload/v1234567890/reference.jpg',
    })
    @Column({ type: 'varchar' })
    imageUrl: string;

    @ApiProperty({
        description: 'Active status of the reference image',
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

    @ApiHideProperty()
    @ManyToOne(() => OrderDetail, (detail) => detail.referenceImages, {
        nullable: false,
    })
    @JoinColumn({ name: 'orderDetailId' })
    orderDetail: OrderDetail;
}
