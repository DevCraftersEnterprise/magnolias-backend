import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from '../../auth/decorators/role-protected.decorator';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { UserRoleGuard } from '../../auth/guards/user-role.guard';
import { UserRoles } from '../../users/enums/user-role';

export function Auth(roles: UserRoles[]) {
  return applyDecorators(
    RoleProtected(roles),
    UseGuards(AccessTokenGuard, AuthGuard('jwt'), UserRoleGuard),
  );
}
