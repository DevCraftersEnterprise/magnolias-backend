import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<Partial<User>> {
    const { name, lastname, username, userkey, role } = dto;

    const userExist = await this.userRepository.findOne({
      where: { username },
    });

    if (userExist) throw new BadRequestException('Username already exists');

    const hashedKey = await argon2.hash(userkey);

    const user = this.userRepository.create({
      name,
      lastname,
      username,
      userkey: hashedKey,
      role,
    });

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
    filters: FilterDto,
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

  async updateUser(dto: UpdateUserDto): Promise<Partial<User>> {
    const { id, name, lastname, role, isActive } = dto;

    const user = await this.userRepository.preload({ id });

    if (!user) throw new BadRequestException('User does not exist');

    user.name = name ?? user.name;
    user.lastname = lastname ?? user.lastname;
    user.role = role ?? user.role;
    user.isActive = isActive ?? user.isActive;

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

  async deleteUser(dto: UpdateUserDto): Promise<void> {
    const { id } = dto;

    const isUserActive = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!isUserActive) {
      throw new BadRequestException(
        'User does not exist or is already inactive',
      );
    }

    await this.userRepository.update(id, { isActive: false });
  }
}
