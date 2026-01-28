import { IsEnum, IsOptional } from 'class-validator';
import { UserRoles } from '../../users/enums/user-role';
import { PaginationDto } from './pagination.dto';
import { OrderStatus } from '../../orders/enums/order-status.enum';

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
  clientPhone?: string;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Order status must be a valid OrderStatus' })
  orderStatus?: OrderStatus;

  @IsOptional()
  orderDate?: Date;

  @IsOptional()
  @IsEnum(UserRoles, { message: 'Role must be a valid UserRole' })
  role?: UserRoles;
}
