import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Flower } from "../entities/flower.entity";

@Injectable()
export class FindOneFlowerUseCase {
    private readonly logger = new Logger(FindOneFlowerUseCase.name);

    constructor(
        @InjectRepository(Flower)
        private readonly flowerRepository: Repository<Flower>,
    ) { }

    async execute(term: string): Promise<Flower> {
        const whereConditions: FindOptionsWhere<Flower> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.name = term.toUpperCase();

        const flower = await this.flowerRepository.findOne({
            where: whereConditions,
        });

        if (!flower) {
            this.logger.warn(`Flower with term ${term} not found`);
            throw new NotFoundException(`Flower with term ${term} not found`);
        }

        return flower;
    }
}