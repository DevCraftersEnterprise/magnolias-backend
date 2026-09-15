import { ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { ProductSize } from '../../common/enums/product-size.enum';
import { BaseCatalogEntity } from '../../common/entities/base-catalog.entity';

// Catálogo "styles" — se muestra al usuario como "Forma" en el frontend
// (el nombre interno de la tabla/entidad no cambia, solo su etiqueta visible).
@Entity({ name: 'styles' })
export class Style extends BaseCatalogEntity {
  @ApiPropertyOptional({
    description:
      'Tamaños de producto para los que aplica esta forma. Vacío/null significa que aplica para cualquier tamaño (cliente #5).',
    enum: ProductSize,
    isArray: true,
  })
  @Column({ type: 'simple-array', nullable: true })
  applicableSizes?: ProductSize[];
}
