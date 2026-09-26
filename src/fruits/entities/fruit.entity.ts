import { Entity } from 'typeorm';
import { PricedCatalogEntity } from '../../common/entities/priced-catalog.entity';

// Catálogo "fruits" — se muestra al usuario como "Fruta" en el frontend
// (cliente #2: catálogo nuevo).
@Entity({ name: 'fruits' })
export class Fruit extends PricedCatalogEntity {}
