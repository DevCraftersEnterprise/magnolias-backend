import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { getRoleLevel } from '../utils/get-role-level.util';

@Injectable()
export class RemoveUserUseCase {
  private readonly logger = new Logger(RemoveUserUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<void> {
    const { id } = updateUserDto;

    this.logger.log(`Removing user with ID ${id} by user: ${currentUser.id}`);

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      this.logger.warn(`User with ID ${id} not found for remove`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.isActive) {
      this.logger.warn(`User with ID ${id} is already inactive`);
      throw new BadRequestException(`User with ID ${id} is already inactive`);
    }

    const currentUserLevel = getRoleLevel(currentUser.role);
    const targetUserLevel = getRoleLevel(user.role);

    if (currentUserLevel <= targetUserLevel) {
      throw new BadRequestException(
        'You do not have permission to remove this user',
      );
    }

    Object.assign(user, { isActive: false, updatedBy: currentUser });

    await this.userRepository.save(user);

    this.logger.log(
      `User with ID ${id} removed successfully by user ${user.id}`,
    );
  }
}
