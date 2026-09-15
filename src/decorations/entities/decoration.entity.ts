import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

// Catálogo "decorations" — se muestra al usuario como "Decoración" en el
// frontend (cliente #2: catálogo nuevo).
@Entity({ name: 'decorations' })
export class Decoration extends BaseCatalogEntity {}
