import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
