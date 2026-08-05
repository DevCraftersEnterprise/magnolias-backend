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
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { Color } from '../../colors/entities/color.entity';
import { ProductSize } from '../../common/enums/product-size.enum';
import { Filling } from '../../fillings/entities/filling.entity';
import { Frosting } from '../../frostings/entities/frosting.entity';
import { User } from '../../users/entities/user.entity';
import { OrderDetail } from './order-detail.entity';

@Entity({ name: 'order_detail_tiers' })
export class OrderDetailTier {
  @ApiProperty({
    description: 'Unique identifier of the tier',
    example: 'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Display order of this tier within the cake (1-based)',
    example: 1,
  })
  @Column({ type: 'int' })
  position: number;

  @ApiProperty({
    description: 'Product size for this tier',
    example: ProductSize.TWENTY_P,
    required: false,
  })
  @Column({ type: 'enum', enum: ProductSize, nullable: true })
  productSize?: ProductSize;

  @ApiProperty({
    description: 'Custom size (if product size is CUSTOM)',
    example: '80 personas',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  customSize?: string;

  @ApiHideProperty()
  @ManyToOne(() => BreadType, { nullable: true })
  @JoinColumn({ name: 'breadTypeId' })
  breadType?: BreadType;

  @ApiHideProperty()
  @ManyToOne(() => Filling, { nullable: true })
  @JoinColumn({ name: 'fillingId' })
  filling?: Filling;

  @ApiHideProperty()
  @ManyToOne(() => Frosting, { nullable: true })
  @JoinColumn({ name: 'frostingId' })
  frosting?: Frosting;

  @ApiHideProperty()
  @ManyToOne(() => Color, { nullable: true })
  @JoinColumn({ name: 'colorId' })
  color?: Color;

  @ApiHideProperty()
  @ManyToOne(() => OrderDetail, (detail) => detail.tiers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderDetailId' })
  orderDetail: OrderDetail;

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
}
