import { FindManyOptions } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * select/relations/order compartidos por todas las consultas de listado de
 * usuarios (FindAllUsersUseCase, FindAllBakersUseCase, FindAllDriversUseCase):
 * mismos campos públicos + sucursal(es), ordenados igual.
 */
export const USER_LIST_QUERY_OPTIONS: Pick<
  FindManyOptions<User>,
  'relations' | 'select' | 'order'
> = {
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
};
