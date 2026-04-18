import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CreateCategoryUseCase } from './usecases/create-category.usecase';
import { FindAllCategoriesUseCase } from './usecases/find-all-categories.usecase';
import { FindOneCategoryUseCase } from './usecases/find-one-category.usecase';
import { RemoveCategoryUseCase } from './usecases/remove-category.usecase';
import { UpdateCategoryUseCase } from './usecases/update-category.usecase';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly findOneCategoryUseCase: FindOneCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly removeCategoryUseCase: RemoveCategoryUseCase,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    return await this.createCategoryUseCase.execute(createCategoryDto, user);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Category> | Category[]> {
    return await this.findAllCategoriesUseCase.execute(paginationDto);
  }

  async findOne(term: string): Promise<Category> {
    return await this.findOneCategoryUseCase.execute(term);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    return await this.updateCategoryUseCase.execute(
      id,
      updateCategoryDto,
      user,
    );
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeCategoryUseCase.execute(id, user);
  }
}
