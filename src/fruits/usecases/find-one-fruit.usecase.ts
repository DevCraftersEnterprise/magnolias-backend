import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Fruit } from '../entities/fruit.entity';

@Injectable()
export class FindOneFruitUseCase extends BaseFindOneCatalogUseCase<Fruit> {
  protected readonly logger = new Logger(FindOneFruitUseCase.name);
  protected readonly entityName = 'Fruit';

  constructor(
    @InjectRepository(Fruit)
    repository: Repository<Fruit>,
  ) {
    super(repository);
  }
}
