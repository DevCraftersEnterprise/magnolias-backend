import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { Flavor } from '../entities/flavor.entity';

@Injectable()
export class FindAllFlavorsUseCase {
  private readonly logger = new Logger(FindAllFlavorsUseCase.name);

  constructor(
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
  ) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Flavor> | Flavor[]> {
    const { limit, offset } = paginationDto;

    const [flavors, total] = await this.flavorRepository.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(`Found ${flavors.length} flavors with pagination`);

      return {
        items: flavors,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${flavors.length} flavors without pagination`);

    return flavors;
  }
}
