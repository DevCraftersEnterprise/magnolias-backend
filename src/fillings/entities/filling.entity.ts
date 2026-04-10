import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

@Entity({ name: 'fillings' })
export class Filling extends BaseCatalogEntity {}
