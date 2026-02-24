import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

import { Baker } from '@/bakers/entities/baker.entity';
import { BakersFilterDto } from '@/bakers/dto/bakers-filter.dto';
import { PaginationResponse } from "@/common/responses/pagination.response";

@Injectable()
export class FindAllBakersUseCase {
    private readonly logger = new Logger(FindAllBakersUseCase.name);

    constructor(
        @InjectRepository(Baker)
        private readonly bakerRepository: Repository<Baker>,
    ) { }

    async execute(bakersFilterDto: BakersFilterDto): Promise<PaginationResponse<Baker> | Baker[]> {
        const { name, area, isActive, limit, offset } = bakersFilterDto;

        const [bakers, total] = await this.bakerRepository.findAndCount({
            where: {
                fullName: name ? ILike(`%${name}%`) : undefined,
                area: area ? area : undefined,
                isActive: typeof isActive === 'boolean' ? isActive : undefined,
            },
            skip: offset,
            take: limit,
            order: { fullName: 'ASC' },
        });

        if (limit !== undefined && offset !== undefined) {
            this.logger.log(`Found ${total} bakers matching filters. Returning page ${Math.floor(offset / limit) + 1} with ${bakers.length} bakers.`);

            return {
                items: bakers,
                total,
                pagination: {
                    limit,
                    offset,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                }
            }
        }

        this.logger.log(`Found ${total} bakers matching filters. Returning all results.`);

        return bakers;
    }
}