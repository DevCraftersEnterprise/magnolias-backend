import { IsEnum, IsOptional } from 'class-validator';
import { UserRoles } from '../../users/enums/user-role';
import { PaginationDto } from './pagination.dto';

export class FilterDto extends PaginationDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  lastname?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  @IsEnum(UserRoles, { message: 'Role must be a valid UserRole' })
  role?: UserRoles;
}
