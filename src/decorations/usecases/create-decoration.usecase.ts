import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCreateCatalogUseCase } from '../../common/usecases/base-create-catalog.usecase';
import { Decoration } from '../entities/decoration.entity';

@Injectable()
export class CreateDecorationUseCase extends BaseCreateCatalogUseCase<Decoration> {
  protected readonly logger = new Logger(CreateDecorationUseCase.name);
  protected readonly entityName = 'Decoration';

  constructor(
    @InjectRepository(Decoration)
    repository: Repository<Decoration>,
  ) {
    super(repository);
  }
}
