import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Category } from '../entities/category.entity';

@Injectable()
export class RemoveCategoryUseCase extends BaseRemoveCatalogUseCase<Category> {
  protected readonly logger = new Logger(RemoveCategoryUseCase.name);
  protected readonly entityName = 'Category';

  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    super(repository);
  }
}
