import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Frosting } from "../entities/frosting.entity";

@Injectable()
export class FindOneFrostingUseCase {
    private readonly logger = new Logger(FindOneFrostingUseCase.name);

    constructor(
        @InjectRepository(Frosting)
        private readonly frostingRepository: Repository<Frosting>,
    ) { }

    async execute(term: string): Promise<Frosting> {
        const whereConditions: FindOptionsWhere<Frosting> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.name = term.toUpperCase();

        const frosting = await this.frostingRepository.findOne({
            where: whereConditions,
        });

        if (!frosting) {
            this.logger.warn(`Frosting with term ${term} not found`);
            throw new NotFoundException(`Frosting with term ${term} not found`);
        }

        return frosting;
    }
}