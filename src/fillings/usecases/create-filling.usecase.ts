import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class CreateFillingUseCase extends BaseCreateCatalogUseCase<Filling> {
  protected readonly logger = new Logger(CreateFillingUseCase.name);
  protected readonly entityName = 'Filling';

  constructor(
    @InjectRepository(Filling)
    repository: Repository<Filling>,
  ) {
    super(repository);
  }
}
