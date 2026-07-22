import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Flavor } from '../entities/flavor.entity';

@Injectable()
export class FindOneFlavorUseCase extends BaseFindOneCatalogUseCase<Flavor> {
  protected readonly logger = new Logger(FindOneFlavorUseCase.name);
  protected readonly entityName = 'Flavor';

  constructor(
    @InjectRepository(Flavor)
    repository: Repository<Flavor>,
  ) {
    super(repository)
  }
}
