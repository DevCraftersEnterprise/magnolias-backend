import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindOneCatalogUseCase } from '../../common/usecases/base-find-one-catalog.usecase';
import { Decoration } from '../entities/decoration.entity';

@Injectable()
export class FindOneDecorationUseCase extends BaseFindOneCatalogUseCase<Decoration> {
  protected readonly logger = new Logger(FindOneDecorationUseCase.name);
  protected readonly entityName = 'Decoration';

  constructor(
    @InjectRepository(Decoration)
    repository: Repository<Decoration>,
  ) {
    super(repository);
  }
}
