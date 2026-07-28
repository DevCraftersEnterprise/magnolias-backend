import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Flower } from '../entities/flower.entity';

@Injectable()
export class UpdateFlowerUseCase extends BaseUpdateCatalogUseCase<Flower> {
  protected readonly logger = new Logger(UpdateFlowerUseCase.name);
  protected readonly entityName = 'Flower';

  constructor(
    @InjectRepository(Flower)
    repository: Repository<Flower>,
  ) {
    super(repository);
  }
}
