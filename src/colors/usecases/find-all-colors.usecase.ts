import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { Color } from "../entities/color.entity";

@Injectable()
export class FindAllColorsUseCase {
    private readonly logger = new Logger(FindAllColorsUseCase.name);

    constructor(
        @InjectRepository(Color)
        private readonly colorRepository: Repository<Color>,
    ) { }

    async execute(paginationDto: PaginationDto): Promise<PaginationResponse<Color> | Color[]> {
        const { limit, offset } = paginationDto;

        const [colors, total] = await this.colorRepository.findAndCount({
            select: {
                id: true,
                name: true,
                value: true,
                isActive: true,
            },
            take: limit,
            skip: offset,
            order: { name: 'ASC' },
        });

        if (limit !== undefined && offset !== undefined) {
            this.logger.log(`Found ${colors.length} colors with pagination`);

            return {
                items: colors,
                total,
                pagination: {
                    limit,
                    offset,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                },
            };
        }

        this.logger.log(`Found ${colors.length} colors without pagination`);

        return colors;
    }
}