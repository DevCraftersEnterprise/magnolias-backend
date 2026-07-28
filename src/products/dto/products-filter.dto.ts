import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TransformBoolean } from '../../common/decorators/transform-boolean.decorator';

export class ProductsFilterDto extends PaginationDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean({ message: 'includeHidden must be a boolean' })
  includeHidden?: boolean;
}
