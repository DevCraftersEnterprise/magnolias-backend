import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssignOrderDto } from "../../../bakers/dto/assign-order.dto";
import { Baker } from "../../../bakers/entities/baker.entity";
import { OrderAssignment } from "../../../bakers/entities/order-assignment.entity";
import { OrdersService } from "../../../orders/orders.service";
import { User } from "../../../users/entities/user.entity";

@Injectable()
export class AssignOrderUseCase {
    private readonly logger = new Logger(AssignOrderUseCase.name);

    constructor(
        @InjectRepository(Baker)
        private readonly bakerRepository: Repository<Baker>,
        @InjectRepository(OrderAssignment)
        private readonly orderAssignmentRepository: Repository<OrderAssignment>,
        private readonly orderService: OrdersService,
    ) { }


    async execute(bakerId: string, assignOrderDto: AssignOrderDto, user: User): Promise<OrderAssignment> {
        const { orderId, assignedDate, notes } = assignOrderDto;

        const baker = await this.bakerRepository.findOne({
            where: { id: bakerId },
        });

        if (!baker) {
            this.logger.warn(`Baker with identifier "${bakerId}" not found`);
            throw new BadRequestException(`Baker with identifier "${bakerId}" not found`);
        }

        const order = await this.orderService.getOrderByTerm(orderId);

        const isAssigned = await this.orderAssignmentRepository.findOne({
            where: {
                order: { id: orderId }
            }
        });

        if (isAssigned) {
            this.logger.warn(`Order with identifier "${orderId}" is already assigned`);
            throw new BadRequestException(`Order with identifier "${orderId}" is already assigned`);
        }

        const assignment = this.orderAssignmentRepository.create({
            baker,
            order,
            assignedDate: assignedDate || new Date(),
            notes: notes ?? '',
            createdBy: user,
            updatedBy: user,
        });

        const savedAssignment = await this.orderAssignmentRepository.save(assignment);

        this.logger.log(`Order with identifier "${orderId}" assigned to baker "${bakerId}" successfully`);

        return savedAssignment;
    }
}