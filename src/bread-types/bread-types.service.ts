import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateBreadTypeDto } from './dto/create-bread-type.dto';
import { UpdateBreadTypeDto } from './dto/update-bread-type.dto';
import { BreadType } from './entities/bread-type.entity';

@Injectable()
export class BreadTypesService {
  constructor(
    @InjectRepository(BreadType)
    private readonly breadTypeRepository: Repository<BreadType>,
  ) {}

  async create(dto: CreateBreadTypeDto, user: User): Promise<BreadType> {
    const { name } = dto;

    const existingBreadType = await this.breadTypeRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingBreadType) {
      throw new BadRequestException(
        `Bread type with name ${name} already exists`,
      );
    }

    const breadType = this.breadTypeRepository.create({
      ...dto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.breadTypeRepository.save(breadType);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<BreadType> | BreadType[]> {
    const { limit, offset } = paginationDto;

    const [breadTypes, total] = await this.breadTypeRepository.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    if (limit && offset) {
      return {
        items: breadTypes,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    return breadTypes;
  }

  async findOne(term: string): Promise<BreadType> {
    const whereConditions: FindOptionsWhere<BreadType> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const breadType = await this.breadTypeRepository.findOne({
      where: whereConditions,
    });

    if (!breadType) {
      throw new NotFoundException(`Bread type with term ${term} not found`);
    }

    return breadType;
  }

  async update(
    id: string,
    dto: UpdateBreadTypeDto,
    user: User,
  ): Promise<BreadType> {
    const breadType = await this.findOne(id);

    if (dto.name && dto.name !== breadType.name) {
      const existingBreadType = await this.breadTypeRepository.findOne({
        where: { name: dto.name.toUpperCase() },
      });

      if (existingBreadType && existingBreadType.id !== id) {
        throw new BadRequestException(
          `Another bread type with name ${dto.name} already exists`,
        );
      }
    }

    Object.assign(breadType, dto);
    breadType.name = breadType.name.toUpperCase();
    breadType.updatedBy = user;

    return await this.breadTypeRepository.save(breadType);
  }

  async remove(id: string, user: User): Promise<void> {
    const breadType = await this.findOne(id);
    breadType.isActive = false;
    breadType.updatedBy = user;
    await this.breadTypeRepository.save(breadType);
  }
}
