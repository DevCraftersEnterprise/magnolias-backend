import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class RemoveBreadTypeUseCase extends BaseRemoveCatalogUseCase<BreadType> {
  protected readonly logger = new Logger(RemoveBreadTypeUseCase.name);
  protected readonly entityName = 'BreadType';

  constructor(
    @InjectRepository(BreadType)
    repository: Repository<BreadType>,
  ) {
    super(repository);
  }
}
