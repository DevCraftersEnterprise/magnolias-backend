import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRemoveCatalogUseCase } from '../../common/usecases/base-remove-catalog.usecase';
import { Decoration } from '../entities/decoration.entity';

@Injectable()
export class RemoveDecorationUseCase extends BaseRemoveCatalogUseCase<Decoration> {
  protected readonly logger = new Logger(RemoveDecorationUseCase.name);
  protected readonly entityName = 'Decoration';

  constructor(
    @InjectRepository(Decoration)
    repository: Repository<Decoration>,
  ) {
    super(repository);
  }
}
