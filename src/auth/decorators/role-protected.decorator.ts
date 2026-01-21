import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/users/enums/user-role';

export const META_ROLE = 'roles-protected';

export const RoleProtected = (roles: UserRoles[]) =>
  SetMetadata(META_ROLE, roles);
