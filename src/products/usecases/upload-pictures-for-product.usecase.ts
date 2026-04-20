import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uploadMultiplePicturesToCloudinary } from '../../common/utils/upload-to-cloudinary';
import { User } from '../../users/entities/user.entity';
import { ProductPicture } from '../entities/product-picture.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class UploadPicturesForProductUseCase {
  private readonly logger = new Logger(UploadPicturesForProductUseCase.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductPicture)
    private readonly productPictureRepository: Repository<ProductPicture>,
  ) { }

  async execute(
    files: Express.Multer.File[],
    id: string,
    user: User,
  ): Promise<Product> {

    let folder = '';

    switch (process.env.NODE_ENV) {
      case 'production': folder = `magnolias/product/pictures/${id}`; break;
      case 'development': folder = `development/magnolias/product/pictures/${id}`; break;
      case 'staging': folder = `staging/magnolias/product/pictures/${id}`; break;
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: { pictures: true, category: true },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        category: {
          id: true,
          name: true,
        },
        pictures: {
          imageUrl: true,
        },
      },
    });

    if (!product) {
      this.logger.warn(`Product with id ${id} not found`);
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Preparar archivos para subida en lotes
    const filesToUpload = files.map((file, index) => ({
      buffer: file.buffer,
      folder,
      fileName: `${Date.now()}-${index}-${id}`,
    }));

    // Subir imágenes en lotes de 3 para evitar timeouts
    const imageUrls = await uploadMultiplePicturesToCloudinary(
      filesToUpload,
      3,
    );

    const pictures = imageUrls.map((url) =>
      this.productPictureRepository.create({
        imageUrl: url,
        product,
        createdBy: user,
        updatedBy: user,
      }),
    );

    await this.productPictureRepository.save(pictures);

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: { pictures: true, category: true },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        category: {
          id: true,
          name: true,
        },
        pictures: {
          imageUrl: true,
        },
      },
    });

    if (!updatedProduct) {
      this.logger.error(`Failed to retrieve updated product with id ${id}`);
      throw new NotFoundException(
        `Failed to retrieve updated product with id ${id}`,
      );
    }

    this.logger.log(`Successfully uploaded pictures for product with id ${id}`);

    return updatedProduct;
  }
}
