import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Frosting } from '../entities/frosting.entity';

@Injectable()
export class CreateFrostingUseCase extends BaseCreateCatalogUseCase<Frosting> {
  protected readonly logger = new Logger(CreateFrostingUseCase.name);
  protected readonly entityName = 'Frosting';

  constructor(
    @InjectRepository(Frosting)
    repository: Repository<Frosting>,
  ) {
    super(repository);
  }
}
