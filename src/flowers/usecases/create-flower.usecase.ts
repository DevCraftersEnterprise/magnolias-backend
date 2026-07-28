import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Flower } from '../entities/flower.entity';

@Injectable()
export class CreateFlowerUseCase extends BaseCreateCatalogUseCase<Flower> {
  protected readonly logger = new Logger(CreateFlowerUseCase.name);
  protected readonly entityName = 'Flower';

  constructor(
    @InjectRepository(Flower)
    repository: Repository<Flower>,
  ) {
    super(repository);
  }
}
