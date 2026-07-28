import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Flower } from '../entities/flower.entity';

@Injectable()
export class RemoveFlowerUseCase extends BaseRemoveCatalogUseCase<Flower> {
  protected readonly logger = new Logger(RemoveFlowerUseCase.name);
  protected readonly entityName = 'Flower';

  constructor(
    @InjectRepository(Flower)
    repository: Repository<Flower>,
  ) {
    super(repository);
  }
}
