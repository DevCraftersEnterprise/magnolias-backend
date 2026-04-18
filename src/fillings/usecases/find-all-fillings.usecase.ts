import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class FindAllFillingsUseCase {
  private readonly logger = new Logger(FindAllFillingsUseCase.name);

  constructor(
    @InjectRepository(Filling)
    private readonly fillingRepository: Repository<Filling>,
  ) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Filling> | Filling[]> {
    const { limit, offset } = paginationDto;

    const [fillings, total] = await this.fillingRepository.findAndCount({
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
      this.logger.log(`Found ${fillings.length} fillings with pagination`);

      return {
        items: fillings,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${fillings.length} fillings without pagination`);

    return fillings;
  }
}
