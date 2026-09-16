import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUpdateCatalogDto } from './base-update-catalog.dto';

/**
 * Para catálogos con precio (relleno, frosting, forma, tipo de pan, flor,
 * decoración, fruta). Category NO usa este DTO: las categorías no manejan
 * precio.
 */
export class PricedUpdateCatalogDto extends BaseUpdateCatalogDto {
  @ApiPropertyOptional({
    description: 'Price of the item',
    example: 50.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be at least 0' })
  price?: number;
}
