import { Entity } from 'typeorm';
import { PricedCatalogEntity } from '../../common/entities/priced-catalog.entity';

@Entity({ name: 'frostings' })
export class Frosting extends PricedCatalogEntity {}
