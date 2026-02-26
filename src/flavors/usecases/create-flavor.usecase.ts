import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { CreateFlavorDto } from "../dto/create-flavor.dto";
import { Flavor } from "../entities/flavor.entity";

@Injectable()
export class CreateFlavorUseCase {
    private readonly logger = new Logger(CreateFlavorUseCase.name);

    constructor(
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
    ) { }

    async execute(createFlavorDto: CreateFlavorDto, user: User): Promise<Flavor> {
        const { name } = createFlavorDto;

        const duplicatedFlavor = await this.flavorRepository.findOne({
            where: { name: name.toUpperCase() }
        });

        if (duplicatedFlavor) {
            this.logger.log(`Duplicated flavor name: ${name}`);
            throw new ConflictException(`Flavor with name ${name} already exists`);
        }

        const flavor = this.flavorRepository.create({
            ...createFlavorDto,
            name: name.toUpperCase(),
            createdBy: user,
            updatedBy: user,
        })

        const savedFlavor = await this.flavorRepository.save(flavor);

        this.logger.log(`Flavor created with ID: ${savedFlavor.id}`);

        return savedFlavor;
    }
}