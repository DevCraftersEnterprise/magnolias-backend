import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { PaginationResponse } from '../common/responses/pagination.response';
import { uploadPictureToCloudinary } from '../common/utils/upload-to-cloudinary';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsFilterDto } from './dto/products-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPicture } from './entities/product-picture.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductPicture)
    private readonly productPictureRepository: Repository<ProductPicture>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createProduct(dto: CreateProductDto, user: User): Promise<Product> {
    const { name, description = '', categoryId } = dto;

    const category = await this.categoriesService.findOne(categoryId);

    const productData: Partial<Product> = {
      name,
      description,
      category,
      createdBy: user,
      updatedBy: user,
    };

    const product = this.productRepository.create(productData);
    await this.productRepository.save(product);
    return product;
  }

  async findProducts(
    filters: ProductsFilterDto,
  ): Promise<PaginationResponse<Product>> {
    const { name, description = '', limit = 10, offset = 0 } = filters;

    const whereConditions: FindOptionsWhere<Product> = {};

    if (name) whereConditions.name = ILike(`%${name}%`);
    if (description) whereConditions.description = ILike(`%${description}%`);

    const [products, total] = await this.productRepository.findAndCount({
      where: {
        ...whereConditions,
        pictures: { isActive: true },
      },
      relations: {
        category: true,
        pictures: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
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
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      items: products,
      total,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }

  async findAllProducts(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { isActive: true, pictures: { isActive: true } },
      relations: { pictures: true },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        pictures: {
          imageUrl: true,
        },
      },
      order: { name: 'ASC' },
    });

    return products;
  }

  async findProductByTerm(term: string): Promise<Product | null> {
    const whereConditions: FindOptionsWhere<Product>[] = [];

    if (isUUID(term)) whereConditions.push({ id: term });
    whereConditions.push({ name: ILike(`%${term}%`) });

    const product = await this.productRepository.findOne({
      where: { ...whereConditions, pictures: { isActive: true } },
      relations: { pictures: true, category: true },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
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

    return product;
  }

  async updateProduct(dto: UpdateProductDto, user: User): Promise<Product> {
    const { id, name, description, isActive, categoryId } = dto;

    const product = await this.productRepository.preload({ id });

    if (!product) throw new NotFoundException('Product does not exist');

    if (categoryId) {
      const category = await this.categoriesService.findOne(categoryId);

      if (product.category.id !== category.id) product.category = category;
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.isActive = isActive ?? product.isActive;
    product.updatedBy = user;

    const updatedProduct = await this.productRepository.save(product);

    return updatedProduct;
  }

  async deleteProduct(dto: UpdateProductDto, user: User): Promise<void> {
    const { id } = dto;

    const isProductActive = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!isProductActive) {
      throw new NotFoundException(
        'Product does not exist or is already inactive',
      );
    }

    await this.productRepository.update(id, {
      isActive: false,
      updatedBy: user,
    });
  }

  async uploadProductPicture(
    files: Express.Multer.File[],
    dto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    const { id } = dto;

    const product = await this.findProductByTerm(id);

    if (!product) throw new NotFoundException('Product does not exist');

    const folder =
      process.env.NODE_ENV === 'development'
        ? `dev/product/pictures/${id}`
        : `product/pictures/${id}`;

    const picturesPromises = files.map((file) => {
      const fileName = `${Date.now()}-${id}`;
      return uploadPictureToCloudinary(file.buffer, folder, fileName);
    });

    const imageUrls = await Promise.all(picturesPromises);

    const pictures = imageUrls.map((url) =>
      this.productPictureRepository.create({
        imageUrl: url,
        createdBy: user,
        updatedBy: user,
        product,
      }),
    );

    await this.productPictureRepository.save(pictures);

    return this.findProductByTerm(id) as Promise<Product>;
  }

  async hideProductPicture(id: string, user: User): Promise<void> {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID format');

    const pictureVisible = await this.productPictureRepository.findOne({
      where: { id, isActive: true },
    });

    if (!pictureVisible) {
      throw new NotFoundException('Picture not found or already hidden');
    }

    pictureVisible.isActive = false;
    pictureVisible.updatedBy = user;

    await this.productPictureRepository.save(pictureVisible);
  }
}
