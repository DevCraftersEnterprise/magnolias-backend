import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindAllCatalogUseCase } from '../../common/usecases/base-find-all-catalog.usecase';
import { Frosting } from '../entities/frosting.entity';

@Injectable()
export class FindAllFrostingsUseCase extends BaseFindAllCatalogUseCase<Frosting> {
  protected readonly logger = new Logger(FindAllFrostingsUseCase.name);
  protected readonly entityName = 'Frosting';

  constructor(
    @InjectRepository(Frosting)
    repository: Repository<Frosting>,
  ) {
    super(repository);
  }
}
