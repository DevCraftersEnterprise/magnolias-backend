import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';
import { BaseUpdateCatalogDto } from '../dto/base-update-catalog.dto';

/**
 * Base use case for updating catalog items
 */
@Injectable()
export abstract class BaseUpdateCatalogUseCase<T extends BaseCatalogEntity> {
    protected abstract readonly logger: Logger;
    protected abstract readonly entityName: string;

    constructor(protected readonly repository: Repository<T>) { }

    async execute(
        id: string,
        dto: BaseUpdateCatalogDto,
        user: User,
    ): Promise<T> {
        const { name } = dto;

        const entity = await this.repository.findOne({ where: { id } as any });

        if (!entity) {
            this.logger.log(`${this.entityName} not found with ID: ${id}`);
            throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
        }

        if (name && name.toUpperCase() !== entity.name) {
            const duplicate = await this.repository.findOne({
                where: { name: name.toUpperCase() } as any,
            });

            if (duplicate && duplicate.id !== id) {
                this.logger.log(`Duplicated ${this.entityName} name: ${name}`);
                throw new ConflictException(
                    `${this.entityName} with name ${name} already exists`,
                );
            }
        }

        Object.assign(entity, dto, {
            name: name?.toUpperCase(),
            updatedBy: user,
        });

        const savedEntity = await this.repository.save(entity);

        this.logger.log(`${this.entityName} updated with ID: ${savedEntity.id}`);

        return savedEntity;
    }
}