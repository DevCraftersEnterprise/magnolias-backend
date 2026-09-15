import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoles } from '../enums/user-role';
import { findUsersByRoleAndBranch } from '../utils/find-users-by-role-and-branch.util';

@Injectable()
export class FindAllDriversUseCase {
  private readonly logger = new Logger(FindAllDriversUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(
    branchId: string
  ): Promise<User[]> {

    const users = await findUsersByRoleAndBranch(
      this.userRepository,
      UserRoles.DRIVER,
      branchId,
    );

    this.logger.log(
      `Found ${users.length} users matching filters. Returning all results.`,
    );

    return users;
  }
}
