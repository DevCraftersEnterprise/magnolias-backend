import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

@Entity({ name: 'bread_types' })
export class BreadType extends BaseCatalogEntity {}
