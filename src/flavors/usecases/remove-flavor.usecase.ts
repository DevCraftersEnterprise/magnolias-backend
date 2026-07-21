import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Flavor } from '../entities/flavor.entity';

@Injectable()
export class RemoveFlavorUseCase extends BaseRemoveCatalogUseCase<Flavor> {
  protected readonly logger = new Logger(RemoveFlavorUseCase.name);
  protected readonly entityName = 'Flavor';

  constructor(
    @InjectRepository(Flavor)
    repository: Repository<Flavor>,
  ) {
    super(repository);
  }
}
