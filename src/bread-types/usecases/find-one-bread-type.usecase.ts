import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class FindOneBreadTypeUseCase extends BaseFindOneCatalogUseCase<BreadType> {
  protected readonly logger = new Logger(FindOneBreadTypeUseCase.name);
  protected readonly entityName = 'BreadType';

  constructor(
    @InjectRepository(BreadType)
    repository: Repository<BreadType>,
  ) {
    super(repository);
  }
}
