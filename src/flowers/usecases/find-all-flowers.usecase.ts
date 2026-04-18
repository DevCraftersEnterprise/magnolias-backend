import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { Flower } from '../entities/flower.entity';
import { FlowersFilterDto } from '../dto/flowers-filter.dto';

@Injectable()
export class FindAllFlowersUseCase {
  private readonly logger = new Logger(FindAllFlowersUseCase.name);

  constructor(
    @InjectRepository(Flower)
    private readonly flowerRepository: Repository<Flower>,
  ) {}

  async execute(
    flowersFilterDto: FlowersFilterDto,
  ): Promise<PaginationResponse<Flower> | Flower[]> {
    const { limit, offset, isActive, name } = flowersFilterDto;

    const whereOptions: FindOptionsWhere<Flower> = {};

    if (isActive !== undefined) whereOptions.isActive = isActive;
    if (name) whereOptions.name = ILike(`%${name}%`);

    const [flowers, total] = await this.flowerRepository.findAndCount({
      where: whereOptions,
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
      this.logger.log(`Found ${flowers.length} flowers with pagination`);

      return {
        items: flowers,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${flowers.length} flowers without pagination`);

    return flowers;
  }
}
