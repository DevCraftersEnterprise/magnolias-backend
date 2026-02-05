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
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { Style } from './entities/style.entity';

@Injectable()
export class StylesService {
  constructor(
    @InjectRepository(Style)
    private readonly styleRepository: Repository<Style>,
  ) {}

  async create(dto: CreateStyleDto, user: User): Promise<Style> {
    const { name } = dto;

    const existingStyle = await this.styleRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingStyle) {
      throw new BadRequestException(`Style with name ${name} already exists`);
    }

    const style = this.styleRepository.create({
      ...dto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.styleRepository.save(style);
  }

  async findAll(): Promise<Style[]> {
    return await this.styleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async paginated(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Style>> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [styles, total] = await this.styleRepository.findAndCount({
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
      items: styles,
      total,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }

  async findOne(term: string): Promise<Style> {
    const whereConditions: FindOptionsWhere<Style> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const style = await this.styleRepository.findOne({
      where: whereConditions,
    });

    if (!style) {
      throw new NotFoundException(`Style with term ${term} not found`);
    }

    return style;
  }

  async update(id: string, dto: UpdateStyleDto, user: User): Promise<Style> {
    const style = await this.findOne(id);

    if (dto.name && dto.name !== style.name) {
      const existingFrosting = await this.styleRepository.findOne({
        where: { name: dto.name.toUpperCase() },
      });

      if (existingFrosting && existingFrosting.id !== id) {
        throw new BadRequestException(
          `Another style with name ${dto.name} already exists`,
        );
      }
    }

    Object.assign(style, dto);
    style.name = style.name.toUpperCase();
    style.updatedBy = user;

    return await this.styleRepository.save(style);
  }

  async remove(id: string, user: User): Promise<void> {
    const style = await this.findOne(id);
    style.isActive = false;
    style.updatedBy = user;
    await this.styleRepository.save(style);
  }
}
