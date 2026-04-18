import { ApiHideProperty } from '@nestjs/swagger';
import { Entity, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'categories' })
export class Category extends BaseCatalogEntity {
  @ApiHideProperty()
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
