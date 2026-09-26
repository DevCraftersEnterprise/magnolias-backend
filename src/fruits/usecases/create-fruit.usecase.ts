import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Fruit } from '../entities/fruit.entity';

@Injectable()
export class CreateFruitUseCase extends BaseCreateCatalogUseCase<Fruit> {
  protected readonly logger = new Logger(CreateFruitUseCase.name);
  protected readonly entityName = 'Fruit';

  constructor(
    @InjectRepository(Fruit)
    repository: Repository<Fruit>,
  ) {
    super(repository);
  }
}
