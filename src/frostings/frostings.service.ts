import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateFrostingDto } from './dto/create-frosting.dto';
import { UpdateFrostingDto } from './dto/update-frosting.dto';
import { Frosting } from './entities/frosting.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class FrostingsService {
  constructor(
    @InjectRepository(Frosting)
    private readonly frostingRepository: Repository<Frosting>,
  ) {}

  async create(dto: CreateFrostingDto, user: User): Promise<Frosting> {
    const { name } = dto;

    const existingFrosting = await this.frostingRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingFrosting) {
      throw new BadRequestException(
        `Frosting with name ${name} already exists`,
      );
    }

    const frosting = this.frostingRepository.create({
      ...dto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.frostingRepository.save(frosting);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Frosting>> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [frostings, total] = await this.frostingRepository.findAndCount({
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

    return {
      items: frostings,
      total,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }

  async findOne(term: string): Promise<Frosting> {
    const whereConditions: FindOptionsWhere<Frosting> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const frosting = await this.frostingRepository.findOne({
      where: whereConditions,
    });

    if (!frosting) {
      throw new NotFoundException(`Frosting with term ${term} not found`);
    }

    return frosting;
  }

  async update(
    id: string,
    dto: UpdateFrostingDto,
    user: User,
  ): Promise<Frosting> {
    const frosting = await this.findOne(id);

    if (dto.name && dto.name !== frosting.name) {
      const existingFrosting = await this.frostingRepository.findOne({
        where: { name: dto.name.toUpperCase() },
      });

      if (existingFrosting && existingFrosting.id !== id) {
        throw new BadRequestException(
          `Another frosting with name ${dto.name} already exists`,
        );
      }
    }

    Object.assign(frosting, dto);
    frosting.name = frosting.name.toUpperCase();
    frosting.updatedBy = user;

    return await this.frostingRepository.save(frosting);
  }

  async remove(id: string, user: User): Promise<void> {
    const frosting = await this.findOne(id);
    frosting.isActive = false;
    frosting.updatedBy = user;
    await this.frostingRepository.save(frosting);
  }
}
