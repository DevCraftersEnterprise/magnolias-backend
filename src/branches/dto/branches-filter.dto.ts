import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class BranchesFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Branch name to filter by',
    example: 'Main Branch',
    required: false,
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Branch address to filter by',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  address?: string;
}
