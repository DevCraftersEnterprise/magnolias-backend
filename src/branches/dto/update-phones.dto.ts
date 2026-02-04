import { IsUUID } from 'class-validator';
import { CreatePhonesDto } from './create-phones.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePhonesDto extends PartialType(CreatePhonesDto) {
  @ApiProperty({
    description: 'Unique identifier for the phone entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;
}
