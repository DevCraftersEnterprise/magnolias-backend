import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUpdateCatalogUseCase } from '../../common/usecases/base-update-catalog.usecase';
import { Decoration } from '../entities/decoration.entity';

@Injectable()
export class UpdateDecorationUseCase extends BaseUpdateCatalogUseCase<Decoration> {
  protected readonly logger = new Logger(UpdateDecorationUseCase.name);
  protected readonly entityName = 'Decoration';

  constructor(
    @InjectRepository(Decoration)
    repository: Repository<Decoration>,
  ) {
    super(repository);
  }
}
