import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Equal, ILike, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersFilterDto } from '../dto/users-filter.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { UserRoles } from '../enums/user-role';
import { USER_LIST_QUERY_OPTIONS } from '../utils/user-list-query.util';

@Injectable()
export class FindAllUsersUseCase {
  private readonly logger = new Logger(FindAllUsersUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(
    usersFilterDto: UsersFilterDto,
    user: User,
  ): Promise<PaginationResponse<User> | User[]> {
    const { name, lastname, username, role, limit, offset } = usersFilterDto;

    const [users, total] = await this.userRepository.findAndCount({
      ...USER_LIST_QUERY_OPTIONS,
      where: {
        id: Not(user.id),
        name: name ? ILike(`%${name}%`) : undefined,
        lastname: lastname ? ILike(`%${lastname}%`) : undefined,
        username: username ? ILike(`%${username}%`) : undefined,
        role:
          user.role === UserRoles.SUPER
            ? (role ?? undefined)
            : role
              ? And(Not(UserRoles.SUPER), Equal(role))
              : Not(UserRoles.SUPER),
      },
      skip: offset,
      take: limit,
    });

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(
        `Found ${total} users matching filters. Returning page ${Math.floor(offset / limit) + 1} with ${users.length} users.`,
      );

      return {
        items: users,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(
      `Found ${total} users matching filters. Returning all results.`,
    );

    return users;
  }
}
