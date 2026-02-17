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
import { CreateFillingDto } from './dto/create-filling.dto';
import { UpdateFillingDto } from './dto/update-filling.dto';
import { Filling } from './entities/filling.entity';

@Injectable()
export class FillingsService {
  constructor(
    @InjectRepository(Filling)
    private readonly fillingRepository: Repository<Filling>,
  ) {}

  async create(dto: CreateFillingDto, user: User): Promise<Filling> {
    const { name } = dto;

    const existingFilling = await this.fillingRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingFilling) {
      throw new BadRequestException(`Filling with name ${name} already exists`);
    }

    const filling = this.fillingRepository.create({
      ...dto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.fillingRepository.save(filling);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Filling> | Filling[]> {
    const { limit, offset } = paginationDto;

    const [fillings, total] = await this.fillingRepository.findAndCount({
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
        items: fillings,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    return fillings;
  }

  async findOne(term: string): Promise<Filling> {
    const whereConditions: FindOptionsWhere<Filling> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const filling = await this.fillingRepository.findOne({
      where: whereConditions,
    });

    if (!filling) {
      throw new NotFoundException(`Filling with term ${term} not found`);
    }

    return filling;
  }

  async update(
    id: string,
    dto: UpdateFillingDto,
    user: User,
  ): Promise<Filling> {
    const filling = await this.findOne(id);

    if (dto.name && dto.name !== filling.name) {
      const existingFilling = await this.fillingRepository.findOne({
        where: { name: dto.name.toUpperCase() },
      });

      if (existingFilling && existingFilling.id !== id) {
        throw new BadRequestException(
          `Another filling with name ${dto.name} already exists`,
        );
      }
    }

    Object.assign(filling, dto);
    filling.name = filling.name.toUpperCase();
    filling.updatedBy = user;

    return await this.fillingRepository.save(filling);
  }

  async remove(id: string, user: User): Promise<void> {
    const filling = await this.findOne(id);
    filling.isActive = false;
    filling.updatedBy = user;
    await this.fillingRepository.save(filling);
  }
}
