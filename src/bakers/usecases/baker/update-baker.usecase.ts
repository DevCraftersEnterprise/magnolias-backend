import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


import { Baker } from '@/bakers/entities/baker.entity';
import { UpdateBakerDto } from '@/bakers/dto/update-baker.dto';

import { User } from "@/users/entities/user.entity";

@Injectable()
export class UpdateBakerUseCase {
    private readonly logger = new Logger(UpdateBakerUseCase.name);

    constructor(
        @InjectRepository(Baker)
        private readonly bakerRepository: Repository<Baker>,
    ) { }

    async execute(id: string, updateBakerDto: UpdateBakerDto, user: User): Promise<Baker> {
        const baker = await this.bakerRepository.findOne({ where: { id } });

        if (!baker) {
            this.logger.warn(`Baker with ID ${id} not found for update`);
            throw new NotFoundException(`Baker with ID ${id} not found`)
        }

        Object.assign(baker, updateBakerDto, { updateBy: user });

        this.logger.log(`Baker with ID ${id} updated successfully by user ${user.id}`);

        return await this.bakerRepository.save(baker);
    }
}