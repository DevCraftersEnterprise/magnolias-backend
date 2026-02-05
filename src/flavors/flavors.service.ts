import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFlavorDto } from './dto/create-flavor.dto';
import { UpdateFlavorDto } from './dto/update-flavor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Flavor } from './entities/flavor.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { isUUID } from 'class-validator';

@Injectable()
export class FlavorsService {
  constructor(
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
  ) {}

  async create(dto: CreateFlavorDto, user: User): Promise<Flavor> {
    const { name } = dto;

    const existingFlavor = await this.flavorRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingFlavor) {
      throw new BadRequestException(`Flavor with name ${name} already exists`);
    }

    const flavor = this.flavorRepository.create({
      ...dto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.flavorRepository.save(flavor);
  }

  async findAll(): Promise<Flavor[]> {
    return await this.flavorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async paginated(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Flavor>> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [flavors, total] = await this.flavorRepository.findAndCount({
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
      items: flavors,
      total,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }

  async findOne(term: string): Promise<Flavor> {
    const whereConditions: FindOptionsWhere<Flavor> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const flavor = await this.flavorRepository.findOne({
      where: whereConditions,
    });

    if (!flavor) {
      throw new NotFoundException(`Flavor with term ${term} not found`);
    }

    return flavor;
  }

  async update(id: string, dto: UpdateFlavorDto, user: User): Promise<Flavor> {
    const flavor = await this.findOne(id);

    if (dto.name && dto.name !== flavor.name) {
      const existingFlavor = await this.flavorRepository.findOne({
        where: { name: dto.name.toUpperCase() },
      });

      if (existingFlavor && existingFlavor.id !== id) {
        throw new BadRequestException(
          `Another flavor with name ${dto.name} already exists`,
        );
      }
    }

    Object.assign(flavor, dto);
    flavor.name = flavor.name.toUpperCase();
    flavor.updatedBy = user;

    return await this.flavorRepository.save(flavor);
  }

  async remove(id: string, user: User): Promise<void> {
    const flavor = await this.findOne(id);
    flavor.isActive = false;
    flavor.updatedBy = user;
    await this.flavorRepository.save(flavor);
  }
}
