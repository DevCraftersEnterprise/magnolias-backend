import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindAllCatalogUseCase } from '../../common/usecases/base-find-all-catalog.usecase';
import { Flavor } from '../entities/flavor.entity';

@Injectable()
export class FindAllFlavorsUseCase extends BaseFindAllCatalogUseCase<Flavor> {
  protected readonly logger = new Logger(FindAllFlavorsUseCase.name);
  protected readonly entityName = 'Flavor';

  constructor(
    @InjectRepository(Flavor)
    repository: Repository<Flavor>,
  ) {
    super(repository);

  }
}
