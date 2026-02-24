import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class NewAddressDataDto {
  @ApiProperty({ example: 'Av. Revolución' })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty({ example: '123-A' })
  @IsString()
  @MaxLength(50)
  number: string;

  @ApiProperty({ example: 'Col. Centro' })
  @IsString()
  @MaxLength(255)
  neighborhood: string;

  @ApiPropertyOptional({ example: 'Guadalajara' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: '44100' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ example: '1234#' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  interphoneCode?: string;

  @ApiPropertyOptional({ example: 'Entre Calle 5 y Calle 7' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  betweenStreets?: string;

  @ApiPropertyOptional({ example: 'Casa azul' })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateOrderDeliveryAddressDto {
  @ApiProperty({
    description: 'Use customer address as delivery address',
    example: true,
  })
  @IsBoolean()
  useCustomerAddress: boolean;

  @ApiPropertyOptional({
    description: 'Use a common address (provide commonAddressId)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  useCommonAddress?: boolean;

  @ApiPropertyOptional({
    description: 'Common address ID (required if useCommonAddress is true)',
    example: 'uuid-common-address',
  })
  @ValidateIf((o) => o.useCommonAddress === true)
  @IsUUID()
  commonAddressId?: string;

  @ApiPropertyOptional({
    description: 'Save this address as a new common address',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  saveAsCommonAddress?: boolean;

  @ApiPropertyOptional({
    description: 'Name for the new common address',
    example: 'Salón Los Arcos',
  })
  @ValidateIf((o) => o.saveAsCommonAddress === true)
  @IsString()
  @MaxLength(150)
  commonAddressName?: string;

  @ApiPropertyOptional({
    description:
      'New address data (required if not using customer or common address)',
    type: NewAddressDataDto,
  })
  @ValidateIf((o) => !o.useCustomerAddress && !o.useCommonAddress)
  @ValidateNested()
  @Type(() => NewAddressDataDto)
  newAddress?: NewAddressDataDto;

  @ApiPropertyOptional({
    description: 'Override interphone code for this delivery',
    example: '9999#',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  interphoneCode?: string;

  @ApiPropertyOptional({
    description: 'Override reference for this delivery',
    example: 'Preguntar por Juan en recepción',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Override between streets for this delivery',
    example: 'Entre Hidalgo y Morelos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  betweenStreets?: string;

  @ApiPropertyOptional({
    description: 'Delivery notes for this specific order',
    example: 'Entregar antes de las 3pm, cuidado con el perro',
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({
    description: 'Name of person receiving (if different from customer)',
    example: 'María García',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  receiverName?: string;

  @ApiPropertyOptional({
    description: 'Phone of person receiving',
    example: '+52 333 123 4567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  receiverPhone?: string;
}
