import { ApiHideProperty } from '@nestjs/swagger';
import { Entity, OneToMany } from 'typeorm';
import { PricedCatalogEntity } from '../../common/entities/priced-catalog.entity';
import { OrderFlower } from '../../orders/entities/order-flower.entity';

@Entity({ name: 'flowers' })
export class Flower extends PricedCatalogEntity {
  @ApiHideProperty()
  @OneToMany(() => OrderFlower, (orderFlower) => orderFlower.flower)
  orderFlowers: OrderFlower[];
}
