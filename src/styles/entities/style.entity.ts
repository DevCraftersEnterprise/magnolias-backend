import { Entity } from 'typeorm';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

// Catálogo "styles" — se muestra al usuario como "Forma" en el frontend
// (el nombre interno de la tabla/entidad no cambia, solo su etiqueta visible).
@Entity({ name: 'styles' })
export class Style extends BaseCatalogEntity {}
