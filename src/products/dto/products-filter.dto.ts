import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ProductsFilterDto extends PaginationDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;
}
