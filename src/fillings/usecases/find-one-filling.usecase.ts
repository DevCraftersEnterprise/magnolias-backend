import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Filling } from "../entities/filling.entity";

@Injectable()
export class FindOneFillingUseCase {
    private readonly logger = new Logger(FindOneFillingUseCase.name);

    constructor(
        @InjectRepository(Filling)
        private readonly fillingRepository: Repository<Filling>,
    ) { }

    async execute(term: string): Promise<Filling> {
        const whereConditions: FindOptionsWhere<Filling> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.name = term.toUpperCase();

        const filling = await this.fillingRepository.findOne({
            where: whereConditions,
        });

        if (!filling) {
            this.logger.warn(`Filling with term ${term} not found`);
            throw new NotFoundException(`Filling with term ${term} not found`);
        }

        return filling;
    }
}