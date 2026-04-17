import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoles } from '../enums/user-role';

@Injectable()
export class FindAllBakersUseCase {
  private readonly logger = new Logger(FindAllBakersUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(
    branchId: string
  ): Promise<User[]> {

    const users = await this.userRepository.find({
      where: {
        branches: {
          id: branchId,
        },
        role: UserRoles.BAKER
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

    this.logger.log(
      `Found ${users.length} users matching filters. Returning all results.`,
    );

    return users;
  }
}
