import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateFlavorDto } from '../dto/update-flavor.dto';
import { Flavor } from '../entities/flavor.entity';

@Injectable()
export class UpdateFlavorUseCase {
  private readonly logger = new Logger(UpdateFlavorUseCase.name);

  constructor(
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
  ) {}

  async execute(
    id: string,
    updateFlavorDto: UpdateFlavorDto,
    user: User,
  ): Promise<Flavor> {
    const { name } = updateFlavorDto;

    const flavor = await this.flavorRepository.findOne({ where: { id } });

    if (!flavor) {
      this.logger.log(`Flavor not found with ID: ${id}`);
      throw new NotFoundException(`Flavor with ID ${id} not found`);
    }

    if (name && name.toUpperCase() !== flavor.name) {
      const duplicatedFlavor = await this.flavorRepository.findOne({
        where: { name: name.toUpperCase() },
      });

      if (duplicatedFlavor && duplicatedFlavor.id !== id) {
        this.logger.log(`Duplicated flavor name: ${name}`);
        throw new ConflictException(`Flavor with name ${name} already exists`);
      }
    }

    Object.assign(flavor, updateFlavorDto, {
      name: name?.toUpperCase(),
      updatedBy: user,
    });

    const savedFlavor = await this.flavorRepository.save(flavor);

    this.logger.log(`Flavor updated with ID: ${savedFlavor.id}`);

    return savedFlavor;
  }
}
