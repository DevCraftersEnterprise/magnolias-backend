import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoles } from '../enums/user-role';
import { USER_LIST_QUERY_OPTIONS } from './user-list-query.util';

/**
 * Consulta compartida por FindAllBakersUseCase/FindAllDriversUseCase (roles
 * operativos multi-sucursal): mismos select/relations/order, solo cambia el
 * rol filtrado.
 */
export function findUsersByRoleAndBranch(
  userRepository: Repository<User>,
  role: UserRoles,
  branchId: string,
): Promise<User[]> {
  return userRepository.find({
    ...USER_LIST_QUERY_OPTIONS,
    where: {
      branches: {
        id: branchId,
      },
      role,
    },
  });
}
