import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRoles } from '../enums/user-role';

export class RegisterUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User password (numeric only, minimum 5 digits)',
    example: '12345',
    minLength: 5,
  })
  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^\d+$/, { message: 'userkey must contain only numbers' })
  userkey: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRoles,
    example: UserRoles.EMPLOYEE,
  })
  @IsNotEmpty()
  @IsEnum(UserRoles, { message: 'role must be a valid UserRoles value' })
  role: UserRoles;

  @ApiProperty({
    description:
      'UUID of the branch to assign the user (required for EMPLOYEE, BAKER, and ASSISTANT roles)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  branchId?: string;
}
