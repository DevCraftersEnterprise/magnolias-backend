import { IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProductsFilterDto extends PaginationDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;
}
