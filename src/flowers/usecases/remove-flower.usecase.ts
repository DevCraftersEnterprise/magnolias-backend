import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Flower } from "../entities/flower.entity";

@Injectable()
export class RemoveFlowerUseCase {
    private readonly logger = new Logger(RemoveFlowerUseCase.name);

    constructor(
        @InjectRepository(Flower)
        private readonly flowerRepository: Repository<Flower>,
    ) { }

    async execute(id: string, user: User): Promise<void> {

        const flower = await this.flowerRepository.findOne({ where: { id } });

        if (!flower) {
            this.logger.log(`Flower not found with ID: ${id}`);
            throw new NotFoundException(`Flower with ID ${id} not found`);
        }

        if (!flower.isActive) {
            this.logger.log(`Flower already removed with ID: ${id}`);
            throw new BadRequestException(`Flower with ID ${id} is already removed`);
        }

        Object.assign(flower, { updatedBy: user, isActive: false });

        await this.flowerRepository.save(flower);

        this.logger.log(`Flower removed with ID: ${id}`);
    }
}