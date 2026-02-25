import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { CreateFrostingDto } from "../dto/create-frosting.dto";
import { Frosting } from "../entities/frosting.entity";

@Injectable()
export class CreateFrostingUseCase {
    private readonly logger = new Logger(CreateFrostingUseCase.name);

    constructor(
        @InjectRepository(Frosting)
        private readonly frostingRepository: Repository<Frosting>,
    ) { }

    async execute(createFrostingDto: CreateFrostingDto, user: User): Promise<Frosting> {
        const { name } = createFrostingDto;

        const duplicatedFrosting = await this.frostingRepository.findOne({
            where: { name: name.toUpperCase() }
        });

        if (duplicatedFrosting) {
            this.logger.log(`Duplicated frosting name: ${name}`);
            throw new ConflictException(`Frosting with name ${name} already exists`);
        }

        const frosting = this.frostingRepository.create({
            ...createFrostingDto,
            name: name.toUpperCase(),
            createdBy: user,
            updatedBy: user,
        })

        const savedFrosting = await this.frostingRepository.save(frosting);

        this.logger.log(`Frosting created with ID: ${savedFrosting.id}`);

        return savedFrosting;
    }
}