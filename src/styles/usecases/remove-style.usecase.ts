import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Style } from '../entities/style.entity';

@Injectable()
export class RemoveStyleUseCase extends BaseRemoveCatalogUseCase<Style> {
  protected readonly logger = new Logger(RemoveStyleUseCase.name);
  protected readonly entityName = 'Style';

  constructor(
    @InjectRepository(Style)
    repository: Repository<Style>,
  ) {
    super(repository);
  }
}
