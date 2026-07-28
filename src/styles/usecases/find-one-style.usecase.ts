import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Style } from '../entities/style.entity';

@Injectable()
export class FindOneStyleUseCase extends BaseFindOneCatalogUseCase<Style> {
  protected readonly logger = new Logger(FindOneStyleUseCase.name);
  protected readonly entityName = 'Style';

  constructor(
    @InjectRepository(Style)
    repository: Repository<Style>,
  ) {
    super(repository);
  }
}
