import { getRoleLevel } from './get-role-level.util';
import { UserRoles } from '../enums/user-role';

describe('getRoleLevel', () => {
  it('asigna niveles decrecientes de SUPER a BAKER', () => {
    expect(getRoleLevel(UserRoles.SUPER)).toBe(5);
    expect(getRoleLevel(UserRoles.ADMIN)).toBe(4);
    expect(getRoleLevel(UserRoles.EMPLOYEE)).toBe(3);
    expect(getRoleLevel(UserRoles.BAKER)).toBe(2);
  });

  it('DRIVER tiene el mismo nivel operativo que BAKER (cliente #8)', () => {
    expect(getRoleLevel(UserRoles.DRIVER)).toBe(getRoleLevel(UserRoles.BAKER));
  });
});
