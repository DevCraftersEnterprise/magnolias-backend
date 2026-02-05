import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStyleDto } from './create-style.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStyleDto extends PartialType(CreateStyleDto) {
  @ApiProperty({
    description: 'Indicates if the style is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
