import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { BaseCatalogEntity } from "../entities/base-catalog.entity";
import { Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { BaseCreateCatalogDto } from "../dto/base-create-catalog.dto";

@Injectable()
export abstract class BaseCreateCatalogUseCase<T extends BaseCatalogEntity> {
    protected abstract readonly logger: Logger;
    protected abstract readonly entityName: string;

    constructor(protected readonly repository: Repository<T>) { }

    async execute(dto: BaseCreateCatalogDto, user: User): Promise<T> {
        const { name } = dto;

        const duplicate = await this.repository.findOne({
            where: { name: name.toUpperCase() } as any
        });

        if (duplicate) {
            this.logger.log(`Duplicated ${this.entityName} name: ${name}`);
            throw new ConflictException(
                `${this.entityName} with name ${name} already exists`,
            );
        }

        const entity = this.repository.create({
            ...dto,
            name: name.toUpperCase(),
            createdBy: user,
            updatedBy: user,
        } as T);

        const savedEntity = await this.repository.save(entity);

        this.logger.log(`Created ${this.entityName} with ID: ${savedEntity.id}`);

        return savedEntity;
    }
}