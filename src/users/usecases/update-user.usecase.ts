import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserRoles } from '../enums/user-role';
import { getRoleLevel } from '../utils/get-role-level.util';
import { sanitizeUser } from '../utils/sanitized-user.util';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) { }

  async execute(
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<Partial<User>> {
    const { id, role, branchId, branchIds } = updateUserDto;

    this.logger.log(`Updating user with ID ${id} by user: ${currentUser.id}`);

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      this.logger.warn(`User with ID ${id} not found for update`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const currentUserLevel = getRoleLevel(currentUser.role);
    const targetUserLevel = getRoleLevel(user.role);

    if (currentUserLevel <= targetUserLevel) {
      throw new BadRequestException(
        'You do not have permission to update this user',
      );
    }

    if (user.role === UserRoles.BAKER && role !== UserRoles.BAKER) {
      this.logger.log(
        `User with ID ${id} is no longer a BAKER, clearing branches`,
      );
      user.branches = [];
    }

    if (currentUser.role !== role && role === UserRoles.BAKER) {
      if (!branchIds || branchIds.length === 0) {
        this.logger.warn(
          `Users with role BAKER must be linked to at least one branch`,
        );
        throw new BadRequestException(
          `Users with role BAKER must be linked to at least one branch`,
        );
      }

      const branchesPromises = branchIds.map((id) =>
        this.branchRepository.findOne({ where: { id } }),
      );
      const branches = await Promise.all(branchesPromises);

      if (branches.length === 0) {
        this.logger.warn(`No valid branches found for the provided branchIds`);
        throw new BadRequestException(
          `No valid branches found for the provided branchIds`,
        );
      }

      Object.assign(user, updateUserDto, {
        updatedBy: currentUser,
        branches,
        branch: null,
      });
    }

    if (branchId && role !== UserRoles.BAKER) {
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }

      Object.assign(user, updateUserDto, {
        updatedBy: currentUser,
        branch,
        branches: [],
      });
    }

    Object.assign(user, updateUserDto, { updatedBy: currentUser });

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `User with ID ${id} updated successfully by user ${user.id}`,
    );

    return sanitizeUser(updatedUser);
  }
}
