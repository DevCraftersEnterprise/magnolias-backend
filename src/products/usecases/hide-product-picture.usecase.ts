import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductPicture } from '../entities/product-picture.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class HideProductPictureUseCase {
  private readonly logger = new Logger(HideProductPictureUseCase.name);

  constructor(
    @InjectRepository(ProductPicture)
    private readonly productPictureRepository: Repository<ProductPicture>,
  ) {}

  async execute(pictureId: string, user: User): Promise<void> {
    const picture = await this.productPictureRepository.findOne({
      where: { id: pictureId },
    });

    if (!picture) {
      this.logger.warn(`Product picture with id ${pictureId} not found`);
      throw new NotFoundException(
        `Product picture with id ${pictureId} not found`,
      );
    }

    if (!picture.isActive) {
      this.logger.warn(
        `Product picture with id ${pictureId} is already hidden`,
      );
      throw new BadRequestException(
        `Product picture with id ${pictureId} is already hidden`,
      );
    }

    Object.assign(picture, { isActive: false, updatedBy: user });

    await this.productPictureRepository.save(picture);

    this.logger.log(
      `Product picture with id ${pictureId} has been hidden by user ${user.id}`,
    );
  }
}
