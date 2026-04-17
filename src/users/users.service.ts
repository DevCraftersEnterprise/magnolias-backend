import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersFilterDto } from './dto/users-filter.dto';
import { User } from './entities/user.entity';
import { FindAllUsersUseCase } from './usecases/find-all-users.usecase';
import { FindOneUserUseCase } from './usecases/find-one-user.usecase';
import { RegisterUserUseCase } from './usecases/register-user.usecase';
import { RemoveUserUseCase } from './usecases/remove-user.usecase';
import { ResetPasswordForUserUseCase } from './usecases/reset-password-for-user.usecase';
import { UpdateUserUseCase } from './usecases/update-user.usecase';
import { FindAllBakersUseCase } from './usecases/find-all-bakers.usecase';

@Injectable()
export class UsersService {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly resetPasswordForUserUseCase: ResetPasswordForUserUseCase,
    private readonly findAllBakersUseCase: FindAllBakersUseCase,
  ) { }

  async registerUser(dto: RegisterUserDto): Promise<Partial<User>> {
    return await this.registerUserUseCase.execute(dto);
  }

  async findUsers(
    filters: UsersFilterDto,
    user: User,
  ): Promise<PaginationResponse<User> | User[]> {
    return await this.findAllUsersUseCase.execute(filters, user);
  }

  async findBakers(branchId: string): Promise<User[]> {
    return await this.findAllBakersUseCase.execute(branchId);
  }

  async findUserByTerm(term: string): Promise<User> {
    return await this.findOneUserUseCase.execute(term);
  }

  async updateUser(
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<Partial<User>> {
    return await this.updateUserUseCase.execute(dto, currentUser);
  }

  async deleteUser(dto: UpdateUserDto, currentUser: User): Promise<void> {
    return await this.removeUserUseCase.execute(dto, currentUser);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    executor: User,
  ): Promise<Partial<User>> {
    return await this.resetPasswordForUserUseCase.execute(
      resetPasswordDto,
      executor,
    );
  }
}
