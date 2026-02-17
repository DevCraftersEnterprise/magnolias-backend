import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { isUUID } from 'class-validator';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const { name } = createCategoryDto;

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingCategory) {
      throw new Error(`Category with name ${name} already exists`);
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Category> | Category[]> {
    const { limit, offset } = paginationDto;

    const [categories, total] = await this.categoryRepository.findAndCount({
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
        items: categories,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    return categories;
  }

  async findOne(term: string): Promise<Category> {
    const whereConditions: FindOptionsWhere<Category> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const breadType = await this.categoryRepository.findOne({
      where: whereConditions,
    });

    if (!breadType) {
      throw new NotFoundException(`Category with term ${term} not found`);
    }

    return breadType;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name.toUpperCase() },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException(
          `Another category with name ${updateCategoryDto.name} already exists`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    category.name = category.name.toUpperCase();
    category.updatedBy = user;

    return await this.categoryRepository.save(category);
  }

  async remove(id: string, user: User): Promise<void> {
    const category = await this.findOne(id);
    category.isActive = false;
    category.updatedBy = user;
    await this.categoryRepository.save(category);
  }
}
