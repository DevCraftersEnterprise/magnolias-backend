import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(dto: CreateProductDto, user: User): Promise<Product> {
    const { name, description = '' } = dto;

    const productData: Partial<Product> = {
      name,
      description,
      createdBy: user,
      updatedBy: user,
    };

    const product = this.productRepository.create(productData);
    await this.productRepository.save(product);
    return product;
  }

  async findProducts(filters: FilterDto): Promise<PaginationResponse<Product>> {
    const { name, description = '', limit = 10, offset = 0 } = filters;

    const whereConditions: FindOptionsWhere<Product> = {};

    if (name) whereConditions.name = ILike(`%${name}%`);
    if (description) whereConditions.description = ILike(`%${description}%`);

    const [products, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return products;
  }

  async findProductByTerm(term: string): Promise<Product | null> {
    const whereCOnditions: FindOptionsWhere<Product>[] = [];

    if (isUUID(term)) whereCOnditions.push({ id: term });
    whereCOnditions.push({ name: ILike(`%${term}%`) });

    const product = await this.productRepository.findOne({
      where: whereCOnditions,
    });

    return product;
  }

  async updateProduct(dto: UpdateProductDto, user: User): Promise<Product> {
    const { id, name, description, isActive } = dto;

    const product = await this.productRepository.preload({ id });

    if (!product) throw new NotFoundException('Product does not exist');

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
}
