import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateBakerDto } from './create-baker.dto';

export class UpdateBakerDto extends PartialType(CreateBakerDto) {
  @ApiProperty({
    description: 'Indicates if the baker is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
