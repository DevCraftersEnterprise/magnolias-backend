import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity({ name: 'order_payments' })
export class OrderPayment {
    @ApiProperty({
        description: 'Unique identifier for the order payment',
        example: 'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiHideProperty()
    @ManyToOne(() => Order, { nullable: false })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @ApiProperty({
        description: 'Amount already paid (for vitrina orders)',
        example: 350.0,
    })
    @Column({ type: 'money', default: 0 })
    paidAmount: number;

    @ApiProperty({
        description: 'Timestamp when the payment record was created',
        example: '2023-01-01T12:00:00Z',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

}