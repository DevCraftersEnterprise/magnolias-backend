import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { UpdateProductDto } from "../dto/update-product.dto";
import { Product } from "../entities/product.entity";

@Injectable()
export class RemoveProductUseCase {
    private readonly logger = new Logger(RemoveProductUseCase.name);

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async execute(updateProductDto: UpdateProductDto, user: User): Promise<void> {
        const { id } = updateProductDto;

        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            this.logger.warn(`Product with ID ${id} not found`);
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        if (!product.isActive) {
            this.logger.warn(`Product with ID ${id} is already inactive`);
            throw new BadRequestException(`Product with ID ${id} is already inactive`);
        }

        if (product.isFavorite) {
            this.logger.warn(`Cannot remove product with ID ${id} because it is marked as favorite`);
            throw new BadRequestException(`Cannot remove product with ID ${id} because it is marked as favorite`);
        }

        Object.assign(product, { isActive: false, updatedBy: user });

        await this.productRepository.save(product);

        this.logger.log(`Product with ID ${id} has been marked as inactive`);
    }
}