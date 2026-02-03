import { IsUUID } from 'class-validator';
import { CreatePhonesDto } from './create-phones.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePhonesDto extends PartialType(CreatePhonesDto) {
  @IsUUID()
  id: string;
}
