import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

@Entity({ name: 'frostings' })
export class Frosting extends BaseCatalogEntity { }