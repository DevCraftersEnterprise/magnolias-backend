import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderAssignment } from "../../../orders/entities/order-assignment.entity";
import { OrderStatus } from "../../../orders/enums/order-status.enum";
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class GetAssignmentsUseCase {
    private readonly logger = new Logger(GetAssignmentsUseCase.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(OrderAssignment)
        private readonly orderAssignmentRepository: Repository<OrderAssignment>,
    ) { }

    async execute(bakerId: string): Promise<OrderAssignment[]> {
        const baker = await this.userRepository.findOne({
            where: { id: bakerId },
        });

        if (!baker) {
            this.logger.warn(`Baker with identifier "${bakerId}" not found`);
            throw new BadRequestException(`Baker with identifier "${bakerId}" not found`);
        }

        const assignments = await this.orderAssignmentRepository.find({
            where: {
                baker: { id: bakerId },
                order: { status: OrderStatus.CREATED || OrderStatus.IN_PROCESS || OrderStatus.DONE }
            },
            relations: {
                order: {
                    branch: true,
                    details: {
                        product: true
                    }
                },
                createdBy: true,
                updatedBy: true,
            },
            select: {
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
                },
                createdBy: {
                    id: true,
                    name: true,
                    lastname: true,
                    role: true,
                    username: true,
                },
                updatedBy: {
                    id: true,
                    name: true,
                    lastname: true,
                    role: true,
                    username: true,
                }
            },
            order: {
                assignedDate: 'DESC'
            }
        });

        return assignments;
    }
}