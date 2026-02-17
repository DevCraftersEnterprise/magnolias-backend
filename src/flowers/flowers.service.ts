import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';
import { Flower } from './entities/flower.entity';
import { User } from '../users/entities/user.entity';
import { isUUID } from 'class-validator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { FlowersFilterDto } from './dto/flowers-filter.dto';

@Injectable()
export class FlowersService {
  constructor(
    @InjectRepository(Flower)
    private readonly flowerRepository: Repository<Flower>,
  ) {}

  async create(createFlowerDto: CreateFlowerDto, user: User): Promise<Flower> {
    const existingFlower = await this.flowerRepository.findOne({
      where: { name: createFlowerDto.name.toUpperCase() },
    });

    if (existingFlower) {
      throw new Error(
        `Flower with name ${createFlowerDto.name} already exists`,
      );
    }

    const flower = this.flowerRepository.create({
      ...createFlowerDto,
      name: createFlowerDto.name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.flowerRepository.save(flower);
  }

  async findAll(
    flowersFilterDto: FlowersFilterDto,
  ): Promise<PaginationResponse<Flower> | Flower[]> {
    const { limit, offset, isActive, name } = flowersFilterDto;

    const whereOptions: FindOptionsWhere<Flower> = {};

    if (isActive) whereOptions.isActive = isActive;
    if (name) whereOptions.name = ILike(`%${name}%`);

    const [flowers, total] = await this.flowerRepository.findAndCount({
      where: whereOptions,
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (limit && offset) {
      return {
        items: flowers,
        total,
        pagination: {
          limit,
          offset,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    return flowers;
  }

  async findOne(term: string): Promise<Flower> {
    const whereCondition: FindOptionsWhere<Flower> = {};

    if (isUUID(term)) whereCondition.id = term;
    else whereCondition.name = term.toUpperCase();

    const flower = await this.flowerRepository.findOne({
      where: whereCondition,
    });

    if (!flower) {
      throw new Error(`Flower with identifier ${term} not found`);
    }
    return flower;
  }

  async update(
    id: string,
    updateFlowerDto: UpdateFlowerDto,
    user: User,
  ): Promise<Flower> {
    const flower = await this.findOne(id);

    if (updateFlowerDto.name && updateFlowerDto.name !== flower.name) {
      const existingFlower = await this.flowerRepository.findOne({
        where: { name: updateFlowerDto.name.toUpperCase() },
      });

      if (existingFlower && existingFlower.id !== flower.id) {
        throw new BadRequestException(
          `Another flower with name "${updateFlowerDto.name}" already exists`,
        );
      }
    }

    Object.assign(flower, updateFlowerDto);
    flower.name = flower.name.toUpperCase();
    flower.updatedBy = user;

    return await this.flowerRepository.save(flower);
  }

  async remove(id: string, user: User): Promise<void> {
    const flower = await this.findOne(id);
    flower.isActive = false;
    flower.updatedBy = user;
    await this.flowerRepository.save(flower);
  }
}
