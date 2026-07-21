import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flavor } from '../entities/flavor.entity';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';

@Injectable()
export class CreateFlavorUseCase extends BaseCreateCatalogUseCase<Flavor> {
  protected readonly logger = new Logger(CreateFlavorUseCase.name);
  protected readonly entityName = 'Flavor';

  constructor(
    @InjectRepository(Flavor)
    repository: Repository<Flavor>,
  ) {
    super(repository);
  }
}
