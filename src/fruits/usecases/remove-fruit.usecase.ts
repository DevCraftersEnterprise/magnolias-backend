import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Fruit } from '../entities/fruit.entity';

@Injectable()
export class RemoveFruitUseCase extends BaseRemoveCatalogUseCase<Fruit> {
  protected readonly logger = new Logger(RemoveFruitUseCase.name);
  protected readonly entityName = 'Fruit';

  constructor(
    @InjectRepository(Fruit)
    repository: Repository<Fruit>,
  ) {
    super(repository);
  }
}
