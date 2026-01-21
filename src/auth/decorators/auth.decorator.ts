import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoles } from '../../users/enums/user-role';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { UserRoleGuard } from '../guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';

export function Auth(roles: UserRoles[]) {
  return applyDecorators(
    RoleProtected(roles),
    UseGuards(AccessTokenGuard, AuthGuard('jwt'), UserRoleGuard),
  );
}
