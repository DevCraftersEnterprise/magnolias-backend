import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { PaginationResponse } from '../../common/responses/pagination.response';
import { StylesFilterDto } from "../dto/styles-filter.dto";
import { Style } from "../entities/style.entity";

@Injectable()
export class FindAllStylesUseCase {
    private readonly logger = new Logger(FindAllStylesUseCase.name);

    constructor(
        @InjectRepository(Style)
        private readonly styleRepository: Repository<Style>,
    ) { }

    async execute(stylesFilterDto: StylesFilterDto): Promise<PaginationResponse<Style> | Style[]> {
        const { limit, offset, isActive } = stylesFilterDto;

        const whereOptions: FindOptionsWhere<Style> = {};

        if (isActive !== undefined) whereOptions.isActive = isActive;

        const [styles, total] = await this.styleRepository.findAndCount({
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
            this.logger.log(`Found ${styles.length} styles with pagination`);

            return {
                items: styles,
                total,
                pagination: {
                    limit,
                    offset,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                },
            };
        }

        this.logger.log(`Found ${styles.length} styles without pagination`);

        return styles;
    }
}