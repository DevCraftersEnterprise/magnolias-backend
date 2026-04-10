import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginationResponse } from '../responses/pagination.response';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';

@Injectable()
export abstract class BaseFindAllCatalogUseCase<T extends BaseCatalogEntity> {
  protected abstract readonly logger: Logger;
  protected abstract readonly entityName: string;

  constructor(protected readonly repository: Repository<T>) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<T> | T[]> {
    const { limit, offset } = paginationDto;

    const [items, total] = await this.repository.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      } as any,
      take: limit,
      skip: offset,
      order: { name: 'ASC' } as any,
    });

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(
        `Found ${items.length} ${this.entityName}s with pagination`,
      );

      return {
        items,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(
      `Found ${items.length} ${this.entityName}s without pagination`,
    );

    return items;
  }
}
