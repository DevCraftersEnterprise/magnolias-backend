import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CreateCategoryUseCase {
  private readonly logger = new Logger(CreateCategoryUseCase.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async execute(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const { name } = createCategoryDto;

    const duplicatedCategory = await this.categoryRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (duplicatedCategory) {
      this.logger.log(`Duplicated category name: ${name}`);
      throw new ConflictException(`Category with name ${name} already exists`);
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    const savedCategory = await this.categoryRepository.save(category);

    this.logger.log(`Category created with ID: ${savedCategory.id}`);

    return savedCategory;
  }
}
