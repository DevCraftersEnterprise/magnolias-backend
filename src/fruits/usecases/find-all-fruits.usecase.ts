import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindAllCatalogUseCase } from '../../common/usecases/base-find-all-catalog.usecase';
import { Fruit } from '../entities/fruit.entity';

@Injectable()
export class FindAllFruitsUseCase extends BaseFindAllCatalogUseCase<Fruit> {
  protected readonly logger = new Logger(FindAllFruitsUseCase.name);
  protected readonly entityName = 'Fruit';

  constructor(
    @InjectRepository(Fruit)
    repository: Repository<Fruit>,
  ) {
    super(repository);
  }
}
