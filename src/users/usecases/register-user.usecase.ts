import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { User } from '../entities/user.entity';
import { UserRoles } from '../enums/user-role';
import { sanitizeUser } from '../utils/sanitized-user.util';

@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) { }

  async execute(registerUserDto: RegisterUserDto): Promise<Partial<User>> {
    const { username, role, branchId, branchIds, userkey } = registerUserDto;

    const userExist = await this.userRepository.findOne({
      where: { username },
    });

    if (userExist) {
      this.logger.warn(`Username "${username}" already exists`);
      throw new BadRequestException(`Username "${username}" already exists`);
    }

    if (role === UserRoles.BAKER && !branchIds) {
      this.logger.warn(
        `Users with role BAKER must be linked to at least one branch`,
      );
      throw new BadRequestException(
        `Users with role BAKER must be linked to at least one branch`,
      );
    }

    const userRolesRequiredBranch = [UserRoles.EMPLOYEE];

    if (userRolesRequiredBranch.includes(role) && !branchId) {
      this.logger.warn(`Users with role ${role} must be assigned to a branch`);
      throw new BadRequestException(
        `Users with role ${role} must be assigned to a branch`,
      );
    }
    const hashedKey = await argon2.hash(userkey);

    const userData: Partial<User> = {
      ...registerUserDto,
      userkey: hashedKey,
    };

    if (branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
      });

      if (!branch) {
        this.logger.warn(`Branch with identifier "${branchId}" not found`);
        throw new BadRequestException(
          `Branch with identifier "${branchId}" not found`,
        );
      }

      if (role === UserRoles.EMPLOYEE) {
        const existingActiveEmployee = await this.userRepository.findOne({
          where: {
            role: UserRoles.EMPLOYEE,
            branch: { id: branchId },
            isActive: true,
          },
        });

        if (existingActiveEmployee) {
          this.logger.warn(
            `Branch ${branchId} already has an active EMPLOYEE account (${existingActiveEmployee.username})`,
          );
          throw new BadRequestException(
            `This branch already has an active shared EMPLOYEE account (${existingActiveEmployee.username}). Deactivate it before creating a new one.`,
          );
        }
      }

      userData.branch = branch;
    }

    if (branchIds) {
      const branchesPromises = branchIds.map((id) =>
        this.branchRepository.findOne({ where: { id } }),
      );
      const branches = await Promise.all(branchesPromises);

      const invalidBranchIds = branchIds.filter((_, index) => !branches[index]);

      if (invalidBranchIds.length > 0) {
        this.logger.warn(
          `Invalid branch IDs provided: ${invalidBranchIds.join(', ')}`,
        );
        throw new BadRequestException(
          `Invalid branch IDs: ${invalidBranchIds.join(', ')}`,
        );
      }

      userData.branches = branches as Branch[];
    }


    const user = this.userRepository.create(userData);

    await this.userRepository.save(user);

    return sanitizeUser(user);
  }
}
