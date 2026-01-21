import { User } from '../entities/user.entity';

export const sanitizeUser = (user: Partial<User>): Partial<User> => {
  return {
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    username: user.username,
    isActive: user.isActive,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
