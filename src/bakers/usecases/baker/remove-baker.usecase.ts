import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Baker } from '../../../bakers/entities/baker.entity';
import { User } from "../../../users/entities/user.entity";

@Injectable()
export class RemoveBakerUseCase {
    private readonly logger = new Logger(RemoveBakerUseCase.name);

    constructor(
        @InjectRepository(Baker)
        private readonly bakerRepository: Repository<Baker>,
    ) { }

    async execute(id: string, user: User): Promise<void> {
        const baker = await this.bakerRepository.findOne({ where: { id } });

        if (!baker) {
            this.logger.warn(`Baker with ID ${id} not found for update`);
            throw new NotFoundException(`Baker with ID ${id} not found`)
        }

        Object.assign(baker, { isActive: false, updatedBy: user });

        await this.bakerRepository.save(baker);

        this.logger.log(`Baker with ID ${id} removed successfully by user ${user.id}`);
    }
}