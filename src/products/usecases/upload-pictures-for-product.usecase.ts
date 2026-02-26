import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Product } from "../entities/product.entity";
import { UpdateProductDto } from "../dto/update-product.dto";
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { uploadPictureToCloudinary } from '../../common/utils/upload-to-cloudinary';
import { ProductPicture } from "../entities/product-picture.entity";

@Injectable()
export class UploadPicturesForProductUseCase {
    private readonly logger = new Logger(UploadPicturesForProductUseCase.name);

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductPicture)
        private readonly productPictureRepository: Repository<ProductPicture>,
    ) { }

    async execute(files: Express.Multer.File[], updateProductDto: UpdateProductDto, user: User): Promise<Product> {
        const { id } = updateProductDto;

        const folder =
            process.env.NODE_ENV === 'development'
                ? `dev/product/pictures/${id}`
                : `product/pictures/${id}`;

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
            }
        });

        if (!product) {
            this.logger.warn(`Product with id ${id} not found`);
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        const picturesPromises = files.map(file => {
            const filename = `${Date.now()}-${id}`;
            return uploadPictureToCloudinary(file.buffer, folder, filename);
        });

        const imageUrls = await Promise.all(picturesPromises);

        const pictures = imageUrls.map(url => this.productPictureRepository.create({
            imageUrl: url,
            product,
            createdBy: user,
            updatedBy: user,
        }));

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
            }
        });

        if (!updatedProduct) {
            this.logger.error(`Failed to retrieve updated product with id ${id}`);
            throw new NotFoundException(`Failed to retrieve updated product with id ${id}`);
        }

        this.logger.log(`Successfully uploaded pictures for product with id ${id}`);

        return updatedProduct;
    }
}