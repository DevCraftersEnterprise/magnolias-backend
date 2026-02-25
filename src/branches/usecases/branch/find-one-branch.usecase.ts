import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Branch } from "../../../branches/entities/branch.entity";

@Injectable()
export class FindOneBranchUseCase {
    private readonly logger = new Logger(FindOneBranchUseCase.name);

    constructor(
        @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
    ) { }

    async execute(term: string): Promise<Branch> {
        const whereConditions: FindOptionsWhere<Branch>[] = [];

        if (isUUID(term)) whereConditions.push({ id: term });
        whereConditions.push({ name: term });

        const branch = await this.branchRepository.findOne({
            where: whereConditions,
            relations: {
                phones: true,
            },
            select: {
                id: true,
                name: true,
                address: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                phones: {
                    phone1: true,
                    phone2: true,
                    whatsapp: true,
                },
            }
        });

        if (!branch) {
            this.logger.warn(`Branch not found with term: ${term}`);
            throw new NotFoundException(`Branch not found with term: ${term}`);
        }

        return branch;
    }
}

