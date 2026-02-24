import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Baker } from '@/bakers/entities/baker.entity';
import { CreateBakerDto } from '@/bakers/dto/create-baker.dto';
import { User } from "@/users/entities/user.entity";

@Injectable()
export class CreateBakerUseCase {
    private readonly logger = new Logger(CreateBakerUseCase.name);

    constructor(
        @InjectRepository(Baker)
        private readonly bakerRepository: Repository<Baker>,
    ) { }

    async execute(createBakerDto: CreateBakerDto, user: User): Promise<Baker> {
        this.logger.log(`Creating baker with data: ${JSON.stringify(createBakerDto)}`);

        const baker = this.bakerRepository.create({
            ...createBakerDto,
            createdBy: user,
            updatedBy: user,
        });

        const savedBaker = await this.bakerRepository.save(baker);

        this.logger.log(`Baker created with ID: ${savedBaker.id}`);

        return savedBaker;
    }
}