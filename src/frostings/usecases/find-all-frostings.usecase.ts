import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { Frosting } from '../entities/frosting.entity';

@Injectable()
export class FindAllFrostingsUseCase {
  private readonly logger = new Logger(FindAllFrostingsUseCase.name);

  constructor(
    @InjectRepository(Frosting)
    private readonly frostingRepository: Repository<Frosting>,
  ) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Frosting> | Frosting[]> {
    const { limit, offset } = paginationDto;

    const [frostings, total] = await this.frostingRepository.findAndCount({
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
      this.logger.log(`Found ${frostings.length} frostings with pagination`);

      return {
        items: frostings,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${frostings.length} frostings without pagination`);

    return frostings;
  }
}
