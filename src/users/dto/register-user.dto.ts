import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRoles } from '../enums/user-role';

export class RegisterUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^\d+$/, { message: 'userkey must contain only numbers' })
  userkey: string;

  @IsNotEmpty()
  @IsEnum(UserRoles, { message: 'role must be a valid UserRoles value' })
  role: UserRoles;

  @IsOptional()
  @IsNotEmpty()
  branchId?: string;
}
