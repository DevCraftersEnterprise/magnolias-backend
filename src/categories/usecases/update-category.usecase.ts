import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Category } from '../entities/category.entity';

@Injectable()
export class UpdateCategoryUseCase extends BaseUpdateCatalogUseCase<Category> {
  protected readonly logger = new Logger(UpdateCategoryUseCase.name);
  protected readonly entityName = 'Category';

  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    super(repository);
  }
}
