import { ApiHideProperty } from '@nestjs/swagger';
import { Entity, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';
import { OrderFlower } from '../../orders/entities/order-flower.entity';

@Entity({ name: 'flowers' })
export class Flower extends BaseCatalogEntity {
  @ApiHideProperty()
  @OneToMany(() => OrderFlower, (orderFlower) => orderFlower.flower)
  orderFlowers: OrderFlower[];
}
