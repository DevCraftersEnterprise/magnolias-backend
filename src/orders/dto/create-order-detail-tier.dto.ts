import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ProductSize } from '../../common/enums/product-size.enum';

export class CreateOrderDetailTierDto {
  @ApiProperty({
    description: 'Display order of this tier within the cake (1-based)',
    example: 1,
  })
  @IsNotEmpty({ message: 'Tier position is required' })
  @IsInt({ message: 'Tier position must be an integer' })
  @Min(1, { message: 'Tier position must be at least 1' })
  position: number;

  @ApiPropertyOptional({
    description: 'Product size for this tier',
    example: ProductSize.TWENTY_P,
    enum: ProductSize,
  })
  @IsOptional()
  @IsEnum(ProductSize, { message: 'Invalid product size' })
  productSize?: ProductSize;

  @ApiPropertyOptional({
    description: 'Custom size (required if productSize is CUSTOM)',
    example: '35 personas',
  })
  @ValidateIf((o) => o.productSize === ProductSize.CUSTOM)
  @IsNotEmpty({ message: 'Custom size is required when size is CUSTOM' })
  @IsString({ message: 'Custom size must be a string' })
  @MaxLength(100)
  customSize?: string;

  @ApiPropertyOptional({
    description: 'ID of the bread type for this tier',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Bread type ID must be a valid UUID' })
  breadTypeId?: string;

  @ApiPropertyOptional({
    description: 'ID of the filling for this tier',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Filling ID must be a valid UUID' })
  fillingId?: string;

  @ApiPropertyOptional({
    description: 'ID of the frosting for this tier',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Frosting ID must be a valid UUID' })
  frostingId?: string;

  @ApiPropertyOptional({
    description: 'ID of the color for this tier',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Color ID must be a valid UUID' })
  colorId?: string;
}
