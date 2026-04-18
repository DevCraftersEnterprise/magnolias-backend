import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class CreateBreadTypeUseCase extends BaseCreateCatalogUseCase<BreadType> {
  protected readonly logger = new Logger(CreateBreadTypeUseCase.name);
  protected readonly entityName = 'BreadType';

  constructor(
    @InjectRepository(BreadType)
    repository: Repository<BreadType>,
  ) {
    super(repository);
  }
}
