import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoles } from '../enums/user-role';

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
    where: {
      branches: {
        id: branchId,
      },
      role,
    },
    relations: {
      branch: true,
      branches: true,
    },
    select: {
      id: true,
      name: true,
      lastname: true,
      username: true,
      role: true,
      area: true,
      phone: true,
      specialty: true,
      isActive: true,
      branch: {
        id: true,
        name: true,
      },
      branches: {
        id: true,
        name: true,
      },
      createdAt: true,
      updatedAt: true,
    },
    order: { createdAt: 'DESC', name: 'ASC' },
  });
}
