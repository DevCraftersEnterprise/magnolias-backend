import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindAllCatalogUseCase } from '../../common/usecases/base-find-all-catalog.usecase';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class FindAllBreadTypesUseCase extends BaseFindAllCatalogUseCase<BreadType> {
  protected readonly logger = new Logger(FindAllBreadTypesUseCase.name);
  protected readonly entityName = 'BreadType';

  constructor(
    @InjectRepository(BreadType)
    repository: Repository<BreadType>,
  ) {
    super(repository);
  }
}
