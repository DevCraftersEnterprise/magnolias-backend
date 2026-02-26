import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Style } from "../entities/style.entity";

@Injectable()
export class RemoveStyleUseCase {
    private readonly logger = new Logger(RemoveStyleUseCase.name);

    constructor(
        @InjectRepository(Style)
        private readonly styleRepository: Repository<Style>,
    ) { }

    async execute(id: string, user: User): Promise<void> {

        const style = await this.styleRepository.findOne({ where: { id } });

        if (!style) {
            this.logger.log(`Style not found with ID: ${id}`);
            throw new NotFoundException(`Style with ID ${id} not found`);
        }

        if (!style.isActive) {
            this.logger.log(`Style already removed with ID: ${id}`);
            throw new BadRequestException(`Style with ID ${id} is already removed`);
        }

        Object.assign(style, { updatedBy: user, isActive: false });

        await this.styleRepository.save(style);

        this.logger.log(`Style removed with ID: ${id}`);
    }
}