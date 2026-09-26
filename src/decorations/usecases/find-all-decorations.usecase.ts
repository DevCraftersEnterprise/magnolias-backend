import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseFindAllCatalogUseCase } from '../../common/usecases/base-find-all-catalog.usecase';
import { Decoration } from '../entities/decoration.entity';

@Injectable()
export class FindAllDecorationsUseCase extends BaseFindAllCatalogUseCase<Decoration> {
  protected readonly logger = new Logger(FindAllDecorationsUseCase.name);
  protected readonly entityName = 'Decoration';

  constructor(
    @InjectRepository(Decoration)
    repository: Repository<Decoration>,
  ) {
    super(repository);
  }
}
