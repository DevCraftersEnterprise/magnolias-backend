import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BakerArea } from '../../common/enums/baker-area.enum';

export class BakersFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by baker name (partial match)',
    example: 'Carlos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name filter must be a string' })
  name?: string;

  @ApiProperty({
    description: 'Filter by area',
    example: BakerArea.PE,
    enum: BakerArea,
    required: false,
  })
  @IsOptional()
  @IsEnum(BakerArea, { message: 'Invalid area' })
  area?: BakerArea;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
