import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateCommonAddressDto } from '@/addresses/dto/create-common-address.dto';

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
