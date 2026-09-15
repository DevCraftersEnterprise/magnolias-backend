import { findUsersByRoleAndBranch } from './find-users-by-role-and-branch.util';
import { UserRoles } from '../enums/user-role';

describe('findUsersByRoleAndBranch', () => {
  it('consulta el repositorio filtrando por rol y sucursal', async () => {
    const userRepository = { find: jest.fn().mockResolvedValue([{ id: 'u1' }]) };

    const result = await findUsersByRoleAndBranch(
      userRepository as never,
      UserRoles.DRIVER,
      'branch-1',
    );

    expect(userRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { branches: { id: 'branch-1' }, role: UserRoles.DRIVER },
      }),
    );
    expect(result).toEqual([{ id: 'u1' }]);
  });

  it('funciona igual para el rol BAKER', async () => {
    const userRepository = { find: jest.fn().mockResolvedValue([]) };

    await findUsersByRoleAndBranch(
      userRepository as never,
      UserRoles.BAKER,
      'branch-2',
    );

    expect(userRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { branches: { id: 'branch-2' }, role: UserRoles.BAKER },
      }),
    );
  });
});
