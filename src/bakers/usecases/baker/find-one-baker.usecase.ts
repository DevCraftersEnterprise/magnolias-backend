import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Baker } from '../../../bakers/entities/baker.entity';

@Injectable()
export class FindOneBakerUseCase {
    private readonly logger = new Logger(FindOneBakerUseCase.name);

    constructor(
        @InjectRepository(Baker)
        private readonly bakerRepository: Repository<Baker>,
    ) { }

    async execute(term: string): Promise<Baker> {
        const whereConditions: FindOptionsWhere<Baker> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.fullName = term;

        const baker = await this.bakerRepository.findOne({
            where: whereConditions,
            relations: {
                assignments: {
                    order: {
                        branch: true,
                        details: {
                            product: true
                        }
                    }
                }
            },
            select: {
                area: true,
                assignments: {
                    order: {
                        id: true,
                        status: true,
                        branch: {
                            id: true,
                            name: true,
                        },
                        branchDepartureTime: true,
                        collectionDateTime: true,
                        deliveryDate: true,
                        deliveryRound: true,
                        deliveryTime: true,
                        details: {
                            id: true,
                            breadType: true,
                            color: true,
                            customSize: true,
                            decorationNotes: true,
                            filling: true,
                            flavor: true,
                            frosting: true,
                            hasWriting: true,
                            notes: true,
                            pipingLocation: true,
                            product: {
                                id: true,
                                name: true,
                                category: true,
                                description: true,
                                pictures: true,
                            },
                            productSize: true,
                            quantity: true,
                            referenceImageUrl: true,
                            style: true,
                            writingLocation: true,
                            writingText: true
                        }
                    }
                }
            }
        });

        if (!baker) {
            this.logger.warn(`Baker with identifier "${term}" not found`);
            throw new BadRequestException(`Baker with identifier "${term}" not found`);
        }

        return baker;
    }
}