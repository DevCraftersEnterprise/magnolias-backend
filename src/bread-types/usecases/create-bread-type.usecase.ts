import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { CreateBreadTypeDto } from "../dto/create-bread-type.dto";
import { BreadType } from "../entities/bread-type.entity";

@Injectable()
export class CreateBreadTypeUseCase {
    private readonly logger = new Logger(CreateBreadTypeUseCase.name);

    constructor(
        @InjectRepository(BreadType)
        private readonly breadTypeRepository: Repository<BreadType>,
    ) { }

    async execute(createBreadTypeDto: CreateBreadTypeDto, user: User): Promise<BreadType> {
        const { name } = createBreadTypeDto;

        const duplicatedBreadType = await this.breadTypeRepository.findOne({
            where: { name: name.toUpperCase() }
        });

        if (duplicatedBreadType) {
            this.logger.log(`Duplicated bread type name: ${name}`);
            throw new ConflictException(`Bread type with name ${name} already exists`);
        }

        const breadType = this.breadTypeRepository.create({
            ...createBreadTypeDto,
            name: name.toUpperCase(),
            createdBy: user,
            updatedBy: user,
        })

        const savedBreadType = await this.breadTypeRepository.save(breadType);

        this.logger.log(`Bread type created with ID: ${savedBreadType.id}`);

        return savedBreadType;
    }
}