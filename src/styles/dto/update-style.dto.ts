import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { BaseUpdateCatalogDto } from '../../common/dto/base-update-catalog.dto';
import { ProductSize } from '../../common/enums/product-size.enum';

export class UpdateStyleDto extends BaseUpdateCatalogDto {
  @ApiPropertyOptional({
    description:
      'Tamaños de producto para los que aplica esta forma. Vacío/omitido significa que aplica para cualquier tamaño.',
    enum: ProductSize,
    isArray: true,
  })
  @IsOptional()
  @IsArray({ message: 'Applicable sizes must be an array' })
  @IsEnum(ProductSize, { each: true, message: 'Invalid product size' })
  applicableSizes?: ProductSize[];
}
