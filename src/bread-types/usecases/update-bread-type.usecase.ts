import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class UpdateBreadTypeUseCase extends BaseUpdateCatalogUseCase<BreadType> {
  protected readonly logger = new Logger(UpdateBreadTypeUseCase.name);
  protected readonly entityName = 'BreadType';

  constructor(
    @InjectRepository(BreadType)
    repository: Repository<BreadType>,
  ) {
    super(repository);
  }
}
