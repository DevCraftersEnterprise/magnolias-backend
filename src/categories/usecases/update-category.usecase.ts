import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class UpdateCategoryUseCase {
  private readonly logger = new Logger(UpdateCategoryUseCase.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async execute(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const { name } = updateCategoryDto;

    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      this.logger.log(`Category not found with ID: ${id}`);
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (name && name.toUpperCase() !== category.name) {
      const duplicatedCategory = await this.categoryRepository.findOne({
        where: { name: name.toUpperCase() },
      });

      if (duplicatedCategory && duplicatedCategory.id !== id) {
        this.logger.log(`Duplicated category name: ${name}`);
        throw new ConflictException(
          `Category with name ${name} already exists`,
        );
      }
    }

    Object.assign(category, updateCategoryDto, {
      name: name?.toUpperCase(),
      updatedBy: user,
    });

    const savedCategory = await this.categoryRepository.save(category);

    this.logger.log(`Category updated with ID: ${savedCategory.id}`);

    return savedCategory;
  }
}
