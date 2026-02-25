import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

import { Branch } from "@/branches/entities/branch.entity";
import { BranchesFilterDto } from "@/branches/dto/branches-filter.dto";
import { PaginationResponse } from "@/common/responses/pagination.response";

@Injectable()
export class FindAllBranchesUseCase {
    private readonly logger = new Logger(FindAllBranchesUseCase.name);

    constructor(
        @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
    ) { }

    async execute(branchesFilterDto: BranchesFilterDto): Promise<PaginationResponse<Branch> | Branch[]> {
        const { name, address, limit, offset } = branchesFilterDto;

        const [branches, total] = await this.branchRepository.findAndCount({
            where: {
                name: name ? ILike(`%${name}%`) : undefined,
                address: address ? ILike(`%${address}%`) : undefined,
            },
            skip: offset,
            take: limit,
            order: { name: 'ASC' },
        });

        if (limit !== undefined && offset !== undefined) {
            this.logger.log(`Found ${total} branches matching filters. Returning page ${Math.floor(offset / limit) + 1} with ${branches.length} branches.`);

            return {
                items: branches,
                total,
                pagination: {
                    limit,
                    offset,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                }
            }
        }

        this.logger.log(`Found ${total} branches matching filters. Returning all results.`);

        return branches;
    }
}