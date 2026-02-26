import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Filling } from "../entities/filling.entity";

@Injectable()
export class RemoveFillingUseCase {
    private readonly logger = new Logger(RemoveFillingUseCase.name);

    constructor(
        @InjectRepository(Filling)
        private readonly fillingRepository: Repository<Filling>,
    ) { }

    async execute(id: string, user: User): Promise<void> {

        const filling = await this.fillingRepository.findOne({ where: { id } });

        if (!filling) {
            this.logger.log(`Filling not found with ID: ${id}`);
            throw new NotFoundException(`Filling with ID ${id} not found`);
        }

        if (!filling.isActive) {
            this.logger.log(`Filling already removed with ID: ${id}`);
            throw new BadRequestException(`Filling with ID ${id} is already removed`);
        }

        Object.assign(filling, { updatedBy: user, isActive: false });

        await this.fillingRepository.save(filling);

        this.logger.log(`Filling removed with ID: ${id}`);
    }
}