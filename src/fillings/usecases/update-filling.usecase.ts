import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class UpdateFillingUseCase extends BaseUpdateCatalogUseCase<Filling> {
  protected readonly logger = new Logger(UpdateFillingUseCase.name);
  protected readonly entityName = 'Filling';

  constructor(
    @InjectRepository(Filling)
    repository: Repository<Filling>,
  ) {
    super(repository);
  }
}
