import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBreadTypeDto } from './create-bread-type.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBreadTypeDto extends PartialType(CreateBreadTypeDto) {
  @ApiProperty({
    description: 'Indicates if the bread type is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
