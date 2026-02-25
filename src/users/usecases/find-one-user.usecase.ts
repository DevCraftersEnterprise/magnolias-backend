import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class FindOneUserUseCase {
    private readonly logger = new Logger(FindOneUserUseCase.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async execute(term: string): Promise<User> {
        const whereConditions: FindOptionsWhere<User>[] = [];

        if (isUUID(term)) whereConditions.push({ id: term });
        whereConditions.push({ name: term });

        const user = await this.userRepository.findOne({
            where: whereConditions,
            relations: {
                branch: true,
                branches: true
            },
            select: {
                id: true,
                name: true,
                lastname: true,
                username: true,
                role: true,
                area: true,
                branch: {
                    id: true,
                    name: true,
                },
                branches: {
                    id: true,
                    name: true,
                },
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            this.logger.warn(`User not found with term: ${term}`);
            throw new NotFoundException(`User not found with term: ${term}`);
        }

        return user;
    }
}

