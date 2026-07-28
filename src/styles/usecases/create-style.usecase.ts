import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Style } from '../entities/style.entity';

@Injectable()
export class CreateStyleUseCase extends BaseCreateCatalogUseCase<Style> {
  protected readonly logger = new Logger(CreateStyleUseCase.name);
  protected readonly entityName = 'Style';

  constructor(
    @InjectRepository(Style)
    repository: Repository<Style>,
  ) {
    super(repository);
  }
}
