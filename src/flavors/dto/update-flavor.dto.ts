import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFlavorDto } from './create-flavor.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateFlavorDto extends PartialType(CreateFlavorDto) {
  @ApiProperty({
    description: 'Indicates if the flavor is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
