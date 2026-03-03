import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateBreadTypeDto } from '../dto/update-bread-type.dto';
import { BreadType } from '../entities/bread-type.entity';

@Injectable()
export class UpdateBreadTypeUseCase {
  private readonly logger = new Logger(UpdateBreadTypeUseCase.name);

  constructor(
    @InjectRepository(BreadType)
    private readonly breadTypeRepository: Repository<BreadType>,
  ) {}

  async execute(
    id: string,
    updateBreadTypeDto: UpdateBreadTypeDto,
    user: User,
  ): Promise<BreadType> {
    const { name } = updateBreadTypeDto;

    const breadType = await this.breadTypeRepository.findOne({ where: { id } });

    if (!breadType) {
      this.logger.log(`Bread type not found with ID: ${id}`);
      throw new NotFoundException(`Bread type with ID ${id} not found`);
    }

    if (name && name.toUpperCase() !== breadType.name) {
      const duplicatedBreadType = await this.breadTypeRepository.findOne({
        where: { name: name.toUpperCase() },
      });

      if (duplicatedBreadType && duplicatedBreadType.id !== id) {
        this.logger.log(`Duplicated bread type name: ${name}`);
        throw new ConflictException(
          `Bread type with name ${name} already exists`,
        );
      }
    }

    Object.assign(breadType, updateBreadTypeDto, {
      name: name?.toUpperCase(),
      updatedBy: user,
    });

    const savedBreadType = await this.breadTypeRepository.save(breadType);

    this.logger.log(`Bread type updated with ID: ${savedBreadType.id}`);

    return savedBreadType;
  }
}
