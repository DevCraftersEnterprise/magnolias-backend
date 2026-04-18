import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CreateStyleDto } from '../dto/create-style.dto';
import { Style } from '../entities/style.entity';

@Injectable()
export class CreateStyleUseCase {
  private readonly logger = new Logger(CreateStyleUseCase.name);

  constructor(
    @InjectRepository(Style)
    private readonly styleRepository: Repository<Style>,
  ) {}

  async execute(createStyleDto: CreateStyleDto, user: User): Promise<Style> {
    const { name } = createStyleDto;

    const duplicatedStyle = await this.styleRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (duplicatedStyle) {
      this.logger.log(`Duplicated style name: ${name}`);
      throw new ConflictException(`Style with name ${name} already exists`);
    }

    const style = this.styleRepository.create({
      ...createStyleDto,
      name: name.toUpperCase(),
      createdBy: user,
      updatedBy: user,
    });

    const savedStyle = await this.styleRepository.save(style);

    this.logger.log(`Style created with ID: ${savedStyle.id}`);

    return savedStyle;
  }
}
