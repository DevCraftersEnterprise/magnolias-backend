import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

@Entity({ name: 'flavors' })
export class Flavor extends BaseCatalogEntity { }
