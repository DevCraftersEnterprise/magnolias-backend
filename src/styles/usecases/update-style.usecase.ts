import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Style } from '../entities/style.entity';

@Injectable()
export class UpdateStyleUseCase extends BaseUpdateCatalogUseCase<Style> {
  protected readonly logger = new Logger(UpdateStyleUseCase.name);
  protected readonly entityName = 'Style';

  constructor(
    @InjectRepository(Style)
    repository: Repository<Style>,
  ) {
    super(repository);
  }
}
