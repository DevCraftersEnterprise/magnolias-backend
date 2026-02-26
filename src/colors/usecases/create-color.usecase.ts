import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateColorDto } from "../dto/create-color.dto";
import { Color } from "../entities/color.entity";

@Injectable()
export class CreateColorUseCase {
    private readonly logger = new Logger(CreateColorUseCase.name);

    constructor(
        @InjectRepository(Color)
        private readonly colorRepository: Repository<Color>,
    ) { }

    async execute(createColorDto: CreateColorDto): Promise<Color> {
        const { name, value } = createColorDto;

        const duplicatedColor = await this.colorRepository.findOne({
            where: { value: value.toUpperCase() }
        });

        if (duplicatedColor) {
            this.logger.log(`Duplicated color value: ${value}`);
            throw new ConflictException(`Color with value ${value} already exists`);
        }

        const color = this.colorRepository.create({
            name: name.toUpperCase(),
            value: value.toUpperCase(),
        });

        const savedColor = await this.colorRepository.save(color);

        this.logger.log(`Color created with ID: ${savedColor.id}`);

        return savedColor;
    }
}