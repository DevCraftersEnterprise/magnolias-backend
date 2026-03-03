import { UserRoles } from '../enums/user-role';

export function getRoleLevel(role: UserRoles): number {
  switch (role) {
    case UserRoles.SUPER:
      return 5;
    case UserRoles.ADMIN:
      return 4;
    case UserRoles.EMPLOYEE:
      return 3;
    case UserRoles.BAKER:
      return 2;
    case UserRoles.ASSISTANT:
      return 1;
    default:
      return 0;
  }
}
