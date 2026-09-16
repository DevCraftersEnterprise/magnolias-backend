import { Entity } from 'typeorm';
import { PricedCatalogEntity } from '../../common/entities/priced-catalog.entity';

// Catálogo "decorations" — se muestra al usuario como "Decoración" en el
// frontend (cliente #2: catálogo nuevo).
@Entity({ name: 'decorations' })
export class Decoration extends PricedCatalogEntity {}
