import { Entity } from 'typeorm';
import { PricedCatalogEntity } from '../../common/entities/priced-catalog.entity';

@Entity({ name: 'fillings' })
export class Filling extends PricedCatalogEntity {}
