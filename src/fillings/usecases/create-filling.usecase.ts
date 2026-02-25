import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { CreateFillingDto } from "../dto/create-filling.dto";
import { Filling } from "../entities/filling.entity";

@Injectable()
export class CreateFillingUseCase {
    private readonly logger = new Logger(CreateFillingUseCase.name);

    constructor(
        @InjectRepository(Filling)
        private readonly fillingRepository: Repository<Filling>,
    ) { }

    async execute(createFillingDto: CreateFillingDto, user: User): Promise<Filling> {
        const { name } = createFillingDto;

        const duplicatedFilling = await this.fillingRepository.findOne({
            where: { name: name.toUpperCase() }
        });

        if (duplicatedFilling) {
            this.logger.log(`Duplicated filling name: ${name}`);
            throw new ConflictException(`Filling with name ${name} already exists`);
        }

        const filling = this.fillingRepository.create({
            ...createFillingDto,
            name: name.toUpperCase(),
            createdBy: user,
            updatedBy: user,
        })

        const savedFilling = await this.fillingRepository.save(filling);

        this.logger.log(`Filling created with ID: ${savedFilling.id}`);

        return savedFilling;
    }
}