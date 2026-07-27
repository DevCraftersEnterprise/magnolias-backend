import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Category } from '../entities/category.entity';

@Injectable()
export class CreateCategoryUseCase extends BaseCreateCatalogUseCase<Category> {
  protected readonly logger = new Logger(CreateCategoryUseCase.name);
  protected readonly entityName = 'Category';

  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    super(repository);
  }
}
