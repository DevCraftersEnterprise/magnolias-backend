import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Baker } from '../bakers/entities/baker.entity';
import { BranchesService } from '../branches/branches.service';
import { PaginationResponse } from '../common/responses/pagination.response';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersFilterDto } from './dto/users-filter.dto';
import { User } from './entities/user.entity';
import { UserRoles } from './enums/user-role';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Baker)
    private readonly bakerRepository: Repository<Baker>,
    private readonly branchService: BranchesService,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<Partial<User>> {
    const { name, lastname, username, userkey, role, branchId, bakerId } = dto;

    const userExist = await this.userRepository.findOne({
      where: { username },
    });

    const requireBranchRoles = [UserRoles.EMPLOYEE, UserRoles.ASSISTANT];

    if (userExist) throw new BadRequestException('Username already exists');

    if (requireBranchRoles.includes(role) && !branchId) {
      throw new BadRequestException(
        `Users with role ${role} must be assigned to a branch`,
      );
    }

    // Validate bakerId is required for BAKER role
    if (role === UserRoles.BAKER && !bakerId) {
      throw new BadRequestException(
        'Users with role BAKER must be linked to a baker profile',
      );
    }

    const branch = await this.branchService.findBranchByTerm(branchId!);

    // Find and validate baker if bakerId is provided
    let baker: Baker | null = null;
    if (bakerId) {
      baker = await this.bakerRepository.findOne({ where: { id: bakerId } });
      if (!baker) {
        throw new BadRequestException('Baker profile not found');
      }

      // Verify baker is not already linked to another user
      const existingBakerUser = await this.userRepository.findOne({
        where: { baker: { id: bakerId } },
      });
      if (existingBakerUser) {
        throw new BadRequestException(
          'This baker profile is already linked to another user',
        );
      }
    }

    const hashedKey = await argon2.hash(userkey);

    const userData: Partial<User> = {
      name,
      lastname,
      username,
      userkey: hashedKey,
      role,
    };

    if (branch) userData.branch = branch;
    if (baker) userData.baker = baker;

    const user = this.userRepository.create(userData);

    await this.userRepository.save(user);

    return {
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUsers(
    filters: UsersFilterDto,
  ): Promise<PaginationResponse<Partial<User>>> {
    const { name, lastname, username, role, limit = 10, offset = 0 } = filters;

    const whereConditions: FindOptionsWhere<User> = {};

    if (name) whereConditions.name = name;
    if (lastname) whereConditions.lastname = lastname;
    if (username) whereConditions.username = username;
    if (role) whereConditions.role = role;

    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

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

  async findUserByTerm(term: string): Promise<Partial<User>> {
    const whereConditions: FindOptionsWhere<User>[] = [];

    if (isUUID(term)) whereConditions.push({ id: term });
    whereConditions.push({ username: term });

    const user = await this.userRepository.findOne({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        userkey: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    return {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      userkey: user.userkey,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<Partial<User>> {
    const { id, name, lastname, role, isActive, branchId } = dto;

    const user = await this.userRepository.preload({ id });
    const branch = await this.branchService.findBranchByTerm(branchId!);

    if (!user) throw new BadRequestException('User does not exist');

    const currentUserLevel = this.getRoleLevel(currentUser.role as UserRoles);
    const targetUserLevel = this.getRoleLevel(user.role as UserRoles);

    if (currentUserLevel <= targetUserLevel) {
      throw new BadRequestException(
        'You do not have permission to update this user',
      );
    }

    user.name = name ?? user.name;
    user.lastname = lastname ?? user.lastname;
    user.role = role ?? user.role;
    user.isActive = isActive ?? user.isActive;
    user.branch = branch ?? user.branch;

    const updatedUser = await this.userRepository.save(user);

    return {
      name: updatedUser.name,
      lastname: updatedUser.lastname,
      username: updatedUser.username,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async deleteUser(dto: UpdateUserDto, currentUser: User): Promise<void> {
    const { id } = dto;

    const isUserActive = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!isUserActive) {
      throw new BadRequestException(
        'User does not exist or is already inactive',
      );
    }

    const currentUserLevel = this.getRoleLevel(currentUser.role as UserRoles);
    const targetUserLevel = this.getRoleLevel(isUserActive.role as UserRoles);

    if (currentUserLevel <= targetUserLevel) {
      throw new BadRequestException(
        'You do not have permission to deactivate this user',
      );
    }

    await this.userRepository.update(id, { isActive: false });
  }

  private getRoleLevel(role: UserRoles): number {
    switch (role) {
      case UserRoles.SUPER:
        return 5;
      case UserRoles.ADMIN:
        return 4;
      case UserRoles.EMPLOYEE:
        return 3;
      case UserRoles.BAKER:
        return 2;
      case UserRoles.ASSISTANT:
        return 1;
      default:
        return 0;
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    executor: User,
  ): Promise<string> {
    const { username, newPassword } = resetPasswordDto;

    const targetUser = await this.userRepository.findOneBy({ username });
    if (!targetUser) throw new NotFoundException('Usuario not found');

    if (executor.role === UserRoles.ADMIN) {
      if (
        targetUser.role === UserRoles.ADMIN ||
        targetUser.role === UserRoles.SUPER
      ) {
        throw new ForbiddenException(
          'Admin users cannot modify other admin or super-user accounts',
        );
      }
    }

    if (
      executor.role !== UserRoles.SUPER &&
      targetUser.role === UserRoles.ADMIN
    ) {
      throw new ForbiddenException(
        'Permission denied: Only super-users can modify admin accounts',
      );
    }

    targetUser.userkey = await argon2.hash(newPassword);
    await this.userRepository.save(targetUser);

    return 'Password updated successfully';
  }
}
