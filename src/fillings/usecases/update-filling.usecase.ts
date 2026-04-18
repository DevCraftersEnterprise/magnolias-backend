import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateFillingDto } from '../dto/update-filling.dto';
import { Filling } from '../entities/filling.entity';

@Injectable()
export class UpdateFillingUseCase {
  private readonly logger = new Logger(UpdateFillingUseCase.name);

  constructor(
    @InjectRepository(Filling)
    private readonly fillingRepository: Repository<Filling>,
  ) {}

  async execute(
    id: string,
    updateFillingDto: UpdateFillingDto,
    user: User,
  ): Promise<Filling> {
    const { name } = updateFillingDto;

    const filling = await this.fillingRepository.findOne({ where: { id } });

    if (!filling) {
      this.logger.log(`Filling not found with ID: ${id}`);
      throw new NotFoundException(`Filling with ID ${id} not found`);
    }

    if (name && name.toUpperCase() !== filling.name) {
      const duplicatedFilling = await this.fillingRepository.findOne({
        where: { name: name.toUpperCase() },
      });

      if (duplicatedFilling && duplicatedFilling.id !== id) {
        this.logger.log(`Duplicated filling name: ${name}`);
        throw new ConflictException(`Filling with name ${name} already exists`);
      }
    }

    Object.assign(filling, updateFillingDto, {
      name: name?.toUpperCase(),
      updatedBy: user,
    });

    const savedFilling = await this.fillingRepository.save(filling);

    this.logger.log(`Filling updated with ID: ${savedFilling.id}`);

    return savedFilling;
  }
}
