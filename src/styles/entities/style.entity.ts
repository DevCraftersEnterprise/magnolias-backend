import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

@Entity({ name: 'styles' })
export class Style extends BaseCatalogEntity {}
