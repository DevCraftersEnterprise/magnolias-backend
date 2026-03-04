import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { TransformBoolean } from '../../common/decorators/transform-boolean.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FrostingsFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Active status of the user',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @TransformBoolean()
  isActive?: boolean;
}
