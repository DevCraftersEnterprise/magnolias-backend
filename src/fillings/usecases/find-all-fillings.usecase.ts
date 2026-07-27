import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindAllCatalogUseCase } from '../../common/usecases/base-find-all-catalog.usecase';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class FindAllFillingsUseCase extends BaseFindAllCatalogUseCase<Filling> {
  protected readonly logger = new Logger(FindAllFillingsUseCase.name);
  protected readonly entityName = 'Filling';

  constructor(
    @InjectRepository(Filling)
    repository: Repository<Filling>,
  ) {
    super(repository);
  }
}
