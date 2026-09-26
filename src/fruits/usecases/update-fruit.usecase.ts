import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Fruit } from '../entities/fruit.entity';

@Injectable()
export class UpdateFruitUseCase extends BaseUpdateCatalogUseCase<Fruit> {
  protected readonly logger = new Logger(UpdateFruitUseCase.name);
  protected readonly entityName = 'Fruit';

  constructor(
    @InjectRepository(Fruit)
    repository: Repository<Fruit>,
  ) {
    super(repository);
  }
}
