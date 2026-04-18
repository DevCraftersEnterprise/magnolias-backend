import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateFlowerDto } from '../dto/update-flower.dto';
import { Flower } from '../entities/flower.entity';

@Injectable()
export class UpdateFlowerUseCase {
  private readonly logger = new Logger(UpdateFlowerUseCase.name);

  constructor(
    @InjectRepository(Flower)
    private readonly flowerRepository: Repository<Flower>,
  ) {}

  async execute(
    id: string,
    updateFlowerDto: UpdateFlowerDto,
    user: User,
  ): Promise<Flower> {
    const { name } = updateFlowerDto;

    const flower = await this.flowerRepository.findOne({ where: { id } });

    if (!flower) {
      this.logger.log(`Flower not found with ID: ${id}`);
      throw new NotFoundException(`Flower with ID ${id} not found`);
    }

    if (name && name.toUpperCase() !== flower.name) {
      const duplicatedFlower = await this.flowerRepository.findOne({
        where: { name: name.toUpperCase() },
      });

      if (duplicatedFlower && duplicatedFlower.id !== id) {
        this.logger.log(`Duplicated flower name: ${name}`);
        throw new ConflictException(`Flower with name ${name} already exists`);
      }
    }

    Object.assign(flower, updateFlowerDto, {
      name: name?.toUpperCase(),
      updatedBy: user,
    });

    const savedFlower = await this.flowerRepository.save(flower);

    this.logger.log(`Flower updated with ID: ${savedFlower.id}`);

    return savedFlower;
  }
}
