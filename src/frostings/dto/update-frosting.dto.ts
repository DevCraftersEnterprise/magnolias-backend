import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFrostingDto } from './create-frosting.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateFrostingDto extends PartialType(CreateFrostingDto) {
  @ApiProperty({
    description: 'Indicates if the frosting is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
