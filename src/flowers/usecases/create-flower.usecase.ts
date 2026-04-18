import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CreateFlowerDto } from '../dto/create-flower.dto';
import { Flower } from '../entities/flower.entity';

@Injectable()
export class CreateFlowerUseCase {
  private readonly logger = new Logger(CreateFlowerUseCase.name);

  constructor(
    @InjectRepository(Flower)
    private readonly flowerRepository: Repository<Flower>,
  ) {}

  async execute(createFlowerDto: CreateFlowerDto, user: User): Promise<Flower> {
    const { name } = createFlowerDto;

    const duplicatedFlower = await this.flowerRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (duplicatedFlower) {
      this.logger.log(`Duplicated flower name: ${name}`);
      throw new ConflictException(`Flower with name ${name} already exists`);
    }

    const flower = this.flowerRepository.create({
      ...createFlowerDto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    const savedFlower = await this.flowerRepository.save(flower);

    this.logger.log(`Flower created with ID: ${savedFlower.id}`);

    return savedFlower;
  }
}
