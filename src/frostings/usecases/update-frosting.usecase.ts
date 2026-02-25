import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { UpdateFrostingDto } from "../dto/update-frosting.dto";
import { Frosting } from "../entities/frosting.entity";

@Injectable()
export class UpdateFrostingUseCase {
    private readonly logger = new Logger(UpdateFrostingUseCase.name);

    constructor(
        @InjectRepository(Frosting)
        private readonly frostingRepository: Repository<Frosting>,
    ) { }

    async execute(id: string, updateFrostingDto: UpdateFrostingDto, user: User): Promise<Frosting> {
        const { name } = updateFrostingDto;

        const frosting = await this.frostingRepository.findOne({ where: { id } });

        if (!frosting) {
            this.logger.log(`Frosting not found with ID: ${id}`);
            throw new NotFoundException(`Frosting with ID ${id} not found`);
        }

        if (name && name.toUpperCase() !== frosting.name) {
            const duplicatedFrosting = await this.frostingRepository.findOne({
                where: { name: name.toUpperCase() }
            });

            if (duplicatedFrosting && duplicatedFrosting.id !== id) {
                this.logger.log(`Duplicated frosting name: ${name}`);
                throw new ConflictException(`Frosting with name ${name} already exists`);
            }
        }

        Object.assign(frosting, updateFrostingDto, { name: name?.toUpperCase(), updatedBy: user });

        const savedFrosting = await this.frostingRepository.save(frosting);

        this.logger.log(`Frosting updated with ID: ${savedFrosting.id}`);

        return savedFrosting;
    }
}