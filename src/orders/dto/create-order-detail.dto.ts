import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PipingLocation } from '../../common/enums/piping-location.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { WritingLocation } from '../../common/enums/writing-location.enum';

export class CreateOrderDetailDto {
  @ApiProperty({
    description: 'ID of the product',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 350.0,
  })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be at least 0' })
  price: number;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({
    description: 'Product size',
    example: ProductSize.TWENTY_P,
    enum: ProductSize,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductSize, { message: 'Invalid product size' })
  productSize?: ProductSize;

  @ApiProperty({
    description: 'Custom size (required if productSize is CUSTOM)',
    example: '35 personas',
    required: false,
  })
  @ValidateIf((o) => o.productSize === ProductSize.CUSTOM)
  @IsNotEmpty({ message: 'Custom size is required when size is CUSTOM' })
  @IsString({ message: 'Custom size must be a string' })
  @MaxLength(100)
  @IsOptional()
  customSize?: string;

  @ApiProperty({
    description: 'ID of the color',
    example: 'b2c3d4e5-f6g7-8901-bcde-fg1234567890',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Color ID must be a valid UUID' })
  colorId?: string;

  @ApiProperty({
    description: 'ID of the bread type',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Bread type ID must be a valid UUID' })
  breadTypeId?: string;

  @ApiProperty({
    description: 'ID of the filling',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Filling ID must be a valid UUID' })
  fillingId?: string;

  @ApiProperty({
    description: 'ID of the flavor',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Flavor ID must be a valid UUID' })
  flavorId?: string;

  @ApiProperty({
    description: 'ID of the frosting',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Frosting ID must be a valid UUID' })
  frostingId?: string;

  @ApiProperty({
    description: 'ID of the style',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Style ID must be a valid UUID' })
  styleId?: string;

  @ApiProperty({
    description: 'Indicates if the item has writing',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'hasWriting must be a boolean' })
  hasWriting?: boolean;

  @ApiProperty({
    description: 'Text to write (required if hasWriting is true)',
    example: 'Feliz Cumpleaños María',
    required: false,
  })
  @ValidateIf((o) => o.hasWriting === true)
  @IsNotEmpty({ message: 'Writing text is required when hasWriting is true' })
  @IsString({ message: 'Writing text must be a string' })
  @MaxLength(255, { message: 'Writing text must not exceed 255 characters' })
  @IsOptional()
  writingText?: string;

  @ApiProperty({
    description: 'Location of the writing',
    example: WritingLocation.TOP,
    enum: WritingLocation,
    required: false,
  })
  @IsOptional()
  @IsEnum(WritingLocation, { message: 'Invalid writing location' })
  writingLocation?: WritingLocation;

  @ApiProperty({
    description: 'Location of piping decoration',
    example: PipingLocation.TOP_BORDER,
    enum: PipingLocation,
    required: false,
  })
  @IsOptional()
  @IsEnum(PipingLocation, { message: 'Invalid piping location' })
  pipingLocation?: PipingLocation;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Sin azúcar, para diabético',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
