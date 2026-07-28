import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Category } from '../entities/category.entity';

@Injectable()
export class FindOneCategoryUseCase extends BaseFindOneCatalogUseCase<Category> {
  protected readonly logger = new Logger(FindOneCategoryUseCase.name);
  protected readonly entityName = 'Category';

  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    super(repository);
  }
}
