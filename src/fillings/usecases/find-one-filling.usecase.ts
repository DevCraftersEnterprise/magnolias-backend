import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class FindOneFillingUseCase extends BaseFindOneCatalogUseCase<Filling> {
  protected readonly logger = new Logger(FindOneFillingUseCase.name);
  protected readonly entityName = 'Filling';

  constructor(
    @InjectRepository(Filling)
    repository: Repository<Filling>,
  ) {
    super(repository);
  }
}
