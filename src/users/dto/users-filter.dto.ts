import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRoles } from '../enums/user-role';

export class UsersFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter users by name',
    required: false,
    example: 'John',
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Filter users by lastname',
    required: false,
    example: 'Doe',
  })
  @IsOptional()
  lastname?: string;

  @ApiProperty({
    description: 'Filter users by username',
    required: false,
    example: 'johndoe',
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Filter users by role',
    required: false,
    enum: UserRoles,
    example: UserRoles.EMPLOYEE,
  })
  @IsOptional()
  @IsEnum(UserRoles, { message: 'Role must be a valid UserRole' })
  role?: UserRoles;
}
