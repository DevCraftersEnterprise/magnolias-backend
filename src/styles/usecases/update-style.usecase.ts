import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateStyleDto } from '../dto/update-style.dto';
import { Style } from '../entities/style.entity';

@Injectable()
export class UpdateStyleUseCase {
  private readonly logger = new Logger(UpdateStyleUseCase.name);

  constructor(
    @InjectRepository(Style)
    private readonly styleRepository: Repository<Style>,
  ) {}

  async execute(
    id: string,
    updateStyleDto: UpdateStyleDto,
    user: User,
  ): Promise<Style> {
    const { name } = updateStyleDto;

    const style = await this.styleRepository.findOne({ where: { id } });

    if (!style) {
      this.logger.log(`Style not found with ID: ${id}`);
      throw new NotFoundException(`Style with ID ${id} not found`);
    }

    if (name && name.toUpperCase() !== style.name) {
      const duplicatedStyle = await this.styleRepository.findOne({
        where: { name: name.toUpperCase() },
      });

      if (duplicatedStyle && duplicatedStyle.id !== id) {
        this.logger.log(`Duplicated style name: ${name}`);
        throw new ConflictException(`Style with name ${name} already exists`);
      }
    }

    Object.assign(style, updateStyleDto, {
      name: name?.toUpperCase(),
      updatedBy: user,
    });

    const savedStyle = await this.styleRepository.save(style);

    this.logger.log(`Style updated with ID: ${savedStyle.id}`);

    return savedStyle;
  }
}
