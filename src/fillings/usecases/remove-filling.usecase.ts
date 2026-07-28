import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class RemoveFillingUseCase extends BaseRemoveCatalogUseCase<Filling> {
  protected readonly logger = new Logger(RemoveFillingUseCase.name);
  protected readonly entityName = 'Filling';

  constructor(
    @InjectRepository(Filling)
    repository: Repository<Filling>,
  ) {
    super(repository);
  }
}
