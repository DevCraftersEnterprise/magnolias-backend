import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';

@Injectable()
export abstract class BaseRemoveCatalogUseCase<T extends BaseCatalogEntity> {
  protected abstract readonly logger: Logger;
  protected abstract readonly entityName: string;

  constructor(protected readonly repository: Repository<T>) {}

  async execute(id: string, user: User): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } as any });

    if (!entity) {
      this.logger.log(`${this.entityName} not found with ID: ${id}`);
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }

    if (!entity.isActive) {
      this.logger.log(`${this.entityName} already removed with ID: ${id}`);
      throw new BadRequestException(
        `${this.entityName} with ID ${id} is already removed`,
      );
    }

    Object.assign(entity, { updatedBy: user, isActive: false });

    await this.repository.save(entity);

    this.logger.log(`${this.entityName} removed with ID: ${id}`);
  }
}
