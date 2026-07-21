import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Flavor } from '../entities/flavor.entity';

@Injectable()
export class UpdateFlavorUseCase extends BaseUpdateCatalogUseCase<Flavor> {
  protected readonly logger = new Logger(UpdateFlavorUseCase.name);
  protected readonly entityName = 'Flavor';

  constructor(
    @InjectRepository(Flavor)
    repository: Repository<Flavor>,
  ) {
    super(repository);
  }
}
