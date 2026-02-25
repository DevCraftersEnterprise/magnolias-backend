import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { BreadType } from "../entities/bread-type.entity";

@Injectable()
export class FindAllBreadTypesUseCase {
    private readonly logger = new Logger(FindAllBreadTypesUseCase.name);

    constructor(
        @InjectRepository(BreadType)
        private readonly breadTypeRepository: Repository<BreadType>,
    ) { }

    async execute(paginationDto: PaginationDto): Promise<PaginationResponse<BreadType> | BreadType[]> {
        const { limit, offset } = paginationDto;

        const whereOptions: FindOptionsWhere<BreadType> = {};

        const [breadTypes, total] = await this.breadTypeRepository.findAndCount({
            where: whereOptions,
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
            },
            take: limit,
            skip: offset,
            order: { name: 'ASC' },
        });

        if (limit !== undefined && offset !== undefined) {
            this.logger.log(`Found ${breadTypes.length} bread types with pagination`);

            return {
                items: breadTypes,
                total,
                pagination: {
                    limit,
                    offset,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                },
            };
        }

        this.logger.log(`Found ${breadTypes.length} bread types without pagination`);

        return breadTypes;
    }
}