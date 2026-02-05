import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFlowerDto } from './create-flower.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFlowerDto extends PartialType(CreateFlowerDto) {
  @ApiProperty({
    description: 'Indicates if the flower is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
