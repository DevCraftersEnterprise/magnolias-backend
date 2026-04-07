import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';

@Injectable()
export abstract class BaseFindOneCatalogUseCase<T extends BaseCatalogEntity> {
    protected abstract readonly logger: Logger;
    protected abstract readonly entityName: string;

    constructor(protected readonly repository: Repository<T>) { }

    async execute(term: string): Promise<T> {
        const whereConditions: FindOptionsWhere<T> = {} as any;

        if (isUUID(term)) {
            whereConditions.id = term as any;
        } else {
            whereConditions.name = term.toUpperCase() as any;
        }

        const entity = await this.repository.findOne({
            where: whereConditions,
        });

        if (!entity) {
            this.logger.warn(`${this.entityName} with term ${term} not found`);
            throw new NotFoundException(
                `${this.entityName} with term ${term} not found`,
            );
        }

        return entity;
    }
}