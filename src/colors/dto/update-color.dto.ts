import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateColorDto } from './create-color.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateColorDto extends PartialType(CreateColorDto) {
  @ApiProperty({
    description: 'Unique identifier of the color',
    example: 'a3f1c9e2-5d4b-4f8e-9c2b-1e2f3a4b5c6d',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Indicates if the color is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
