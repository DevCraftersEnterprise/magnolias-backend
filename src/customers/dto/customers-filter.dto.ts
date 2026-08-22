import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { TransformBoolean } from '../../common/decorators/transform-boolean.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

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
    description: 'Filter customers by the last 4 digits of their phone number',
    example: '4567',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'last4 must be exactly 4 digits' })
  last4?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @TransformBoolean()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
