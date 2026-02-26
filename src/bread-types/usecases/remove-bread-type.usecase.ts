import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { BreadType } from "../entities/bread-type.entity";

@Injectable()
export class RemoveBreadTypeUseCase {
    private readonly logger = new Logger(RemoveBreadTypeUseCase.name);

    constructor(
        @InjectRepository(BreadType)
        private readonly breadTypeRepository: Repository<BreadType>,
    ) { }

    async execute(id: string, user: User): Promise<void> {

        const breadType = await this.breadTypeRepository.findOne({ where: { id } });

        if (!breadType) {
            this.logger.log(`Bread type not found with ID: ${id}`);
            throw new NotFoundException(`Bread type with ID ${id} not found`);
        }

        if (!breadType.isActive) {
            this.logger.log(`Bread type already removed with ID: ${id}`);
            throw new BadRequestException(`Bread type with ID ${id} is already removed`);
        }

        Object.assign(breadType, { updatedBy: user, isActive: false });

        await this.breadTypeRepository.save(breadType);

        this.logger.log(`Bread type removed with ID: ${id}`);
    }
}