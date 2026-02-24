import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCommonAddressDto } from './create-common-address.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCommonAddressDto extends PartialType(
  CreateCommonAddressDto,
) {
  @ApiProperty({
    description: 'Indicates if the address is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
