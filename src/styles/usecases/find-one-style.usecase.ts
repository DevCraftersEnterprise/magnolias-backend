import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Style } from "../entities/style.entity";

@Injectable()
export class FindOneStyleUseCase {
    private readonly logger = new Logger(FindOneStyleUseCase.name);

    constructor(
        @InjectRepository(Style)
        private readonly styleRepository: Repository<Style>,
    ) { }

    async execute(term: string): Promise<Style> {
        const whereConditions: FindOptionsWhere<Style> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.name = term.toUpperCase();

        const style = await this.styleRepository.findOne({
            where: whereConditions,
        });

        if (!style) {
            this.logger.warn(`Style with term ${term} not found`);
            throw new NotFoundException(`Style with term ${term} not found`);
        }

        return style;
    }
}