import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Flavor } from "../entities/flavor.entity";

@Injectable()
export class FindOneFlavorUseCase {
    private readonly logger = new Logger(FindOneFlavorUseCase.name);

    constructor(
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
    ) { }

    async execute(term: string): Promise<Flavor> {
        const whereConditions: FindOptionsWhere<Flavor> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.name = term.toUpperCase();

        const flavor = await this.flavorRepository.findOne({
            where: whereConditions,
        });

        if (!flavor) {
            this.logger.warn(`Flavor with term ${term} not found`);
            throw new NotFoundException(`Flavor with term ${term} not found`);
        }

        return flavor;
    }
}