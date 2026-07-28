import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Frosting } from '../entities/frosting.entity';

@Injectable()
export class RemoveFrostingUseCase extends BaseRemoveCatalogUseCase<Frosting> {
  protected readonly logger = new Logger(RemoveFrostingUseCase.name);
  protected readonly entityName = 'Frosting';

  constructor(
    @InjectRepository(Frosting)
    repository: Repository<Frosting>,
  ) {
    super(repository);
  }
}
