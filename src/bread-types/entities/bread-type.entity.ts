import { Entity } from 'typeorm';
import { PricedCatalogEntity } from '../../common/entities/priced-catalog.entity';

@Entity({ name: 'bread_types' })
export class BreadType extends PricedCatalogEntity {}
