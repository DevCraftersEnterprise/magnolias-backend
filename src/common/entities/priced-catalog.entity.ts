import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

/**
 * Catálogos con precio (relleno, frosting, forma, tipo de pan, flor,
 * decoración, fruta): a diferencia de BaseCatalogEntity, agregan `price`
 * para mostrarse/verificarse en el paso 4 del pedido. Category NO extiende
 * esta clase: las categorías no manejan precio.
 */
export abstract class PricedCatalogEntity extends BaseCatalogEntity {
  @ApiProperty({
    description: 'Price of the item',
    example: 50.0,
  })
  @Column({ type: 'money', default: 0 })
  price: number;
}
