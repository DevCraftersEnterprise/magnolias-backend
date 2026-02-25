import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Flavor } from "../entities/flavor.entity";

@Injectable()
export class RemoveFlavorUseCase {
    private readonly logger = new Logger(RemoveFlavorUseCase.name);

    constructor(
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
    ) { }

    async execute(id: string, user: User): Promise<void> {

        const flavor = await this.flavorRepository.findOne({ where: { id } });

        if (!flavor) {
            this.logger.log(`Flavor not found with ID: ${id}`);
            throw new NotFoundException(`Flavor with ID ${id} not found`);
        }

        if (!flavor.isActive) {
            this.logger.log(`Flavor already removed with ID: ${id}`);
            throw new BadRequestException(`Flavor with ID ${id} is already removed`);
        }

        Object.assign(flavor, { updatedBy: user, isActive: false });

        await this.flavorRepository.save(flavor);

        this.logger.log(`Flavor removed with ID: ${id}`);


    }
}