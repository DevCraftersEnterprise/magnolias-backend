import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class FindOneBreadTypeUseCase {
  private readonly logger = new Logger(FindOneBreadTypeUseCase.name);

  constructor(
    @InjectRepository(BreadType)
    private readonly breadTypeRepository: Repository<BreadType>,
  ) {}

  async execute(term: string): Promise<BreadType> {
    const whereConditions: FindOptionsWhere<BreadType> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const breadType = await this.breadTypeRepository.findOne({
      where: whereConditions,
    });

    if (!breadType) {
      this.logger.warn(`Bread type with term ${term} not found`);
      throw new NotFoundException(`Bread type with term ${term} not found`);
    }

    return breadType;
  }
}
