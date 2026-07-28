import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Frosting } from '../entities/frosting.entity';

@Injectable()
export class FindOneFrostingUseCase extends BaseFindOneCatalogUseCase<Frosting> {
  protected readonly logger = new Logger(FindOneFrostingUseCase.name);
  protected readonly entityName = 'Frosting';

  constructor(
    @InjectRepository(Frosting)
    repository: Repository<Frosting>,
  ) {
    super(repository);
  }
}
