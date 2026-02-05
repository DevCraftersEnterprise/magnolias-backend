import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomersFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by customer name (partial match)',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name filter must be a string' })
  name?: string;

  @ApiProperty({
    description: 'Filter by phone number (partial match)',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone filter must be a string' })
  phone?: string;

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
