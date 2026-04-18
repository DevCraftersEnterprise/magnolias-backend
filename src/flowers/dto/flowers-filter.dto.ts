import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransformBoolean } from '../../common/decorators/transform-boolean.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FlowersFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Name of the flower type',
    example: 'Rosa',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

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
