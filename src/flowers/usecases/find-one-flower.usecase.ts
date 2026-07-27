import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Flower } from '../entities/flower.entity';

@Injectable()
export class FindOneFlowerUseCase extends BaseFindOneCatalogUseCase<Flower> {
  protected readonly logger = new Logger(FindOneFlowerUseCase.name);
  protected readonly entityName = 'Flower';

  constructor(
    @InjectRepository(Flower)
    repository: Repository<Flower>,
  ) {
    super(repository);
  }
}
