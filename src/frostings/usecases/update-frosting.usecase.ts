import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Frosting } from '../entities/frosting.entity';

@Injectable()
export class UpdateFrostingUseCase extends BaseUpdateCatalogUseCase<Frosting> {
  protected readonly logger = new Logger(UpdateFrostingUseCase.name);
  protected readonly entityName = 'Frosting';

  constructor(
    @InjectRepository(Frosting)
    repository: Repository<Frosting>,
  ) {
    super(repository);
  }
}
