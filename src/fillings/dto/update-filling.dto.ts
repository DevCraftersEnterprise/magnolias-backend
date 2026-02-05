import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFillingDto } from './create-filling.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFillingDto extends PartialType(CreateFillingDto) {
  @ApiProperty({
    description: 'Indicates if the filling is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
