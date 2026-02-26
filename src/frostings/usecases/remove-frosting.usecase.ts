import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Frosting } from "../entities/frosting.entity";

@Injectable()
export class RemoveFrostingUseCase {
    private readonly logger = new Logger(RemoveFrostingUseCase.name);

    constructor(
        @InjectRepository(Frosting)
        private readonly frostingRepository: Repository<Frosting>,
    ) { }

    async execute(id: string, user: User): Promise<void> {

        const frosting = await this.frostingRepository.findOne({ where: { id } });

        if (!frosting) {
            this.logger.log(`Frosting not found with ID: ${id}`);
            throw new NotFoundException(`Frosting with ID ${id} not found`);
        }

        if (!frosting.isActive) {
            this.logger.log(`Frosting already removed with ID: ${id}`);
            throw new BadRequestException(`Frosting with ID ${id} is already removed`);
        }

        Object.assign(frosting, { updatedBy: user, isActive: false });

        await this.frostingRepository.save(frosting);

        this.logger.log(`Frosting removed with ID: ${id}`);
    }
}