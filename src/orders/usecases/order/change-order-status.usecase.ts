import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Order } from '../../entities/order.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderCancellation } from '../../entities/order-cancellation.entity';
import { UpdateOrderDto } from '../../dto/update-order.dto';
import { OrderStatus } from '../../enums/order-status.enum';
import { User } from '../../../users/entities/user.entity';
import { CancelOrderDto } from '../../dto/cancel-order.dto';

@Injectable()
export class ChangeOrderStatusUseCase {
    private readonly logger = new Logger(ChangeOrderStatusUseCase.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderCancellation)
        private readonly cancellationRepository: Repository<OrderCancellation>,
    ) { }

    async execute(updateOrderDto: UpdateOrderDto, orderStatus: OrderStatus, user: User, cancelOrderDto?: CancelOrderDto): Promise<Order> {
        const { id } = updateOrderDto;

        const order = await this.orderRepository.findOne({ where: { id } });

        if (!order) {
            this.logger.warn(`Order with ID ${id} not found`);
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        if (order.status === OrderStatus.CANCELED) {
            this.logger.warn(`Cannot change status of a canceled order (ID: ${id})`);
            throw new BadRequestException(`Cannot change status of a canceled order (ID: ${id})`);
        }

        this.logger.log(`Changing status of order ID ${id} from ${order.status} to ${orderStatus} by user ${user.id}`);

        Object.assign(order, { status: orderStatus, updatedBy: user });

        const updatedOrder = await this.orderRepository.save(order);

        this.logger.log(`Order ID ${id} status changed to ${orderStatus} successfully`);

        if (orderStatus === OrderStatus.CANCELED && cancelOrderDto) {
            this.logger.log(`Creating cancellation record for order ID ${id} by user ${user.id}`);
            await this.handleCancellation(cancelOrderDto, user, order);
        }

        return updatedOrder;
    }

    private async handleCancellation(cancelOrderDto: CancelOrderDto, user: User, order: Order): Promise<void> {
        const { reason } = cancelOrderDto;

        const cancelletion = this.cancellationRepository.create({
            order,
            description: reason,
            canceledBy: user,
        });

        await this.cancellationRepository.save(cancelletion);

        this.logger.log(`Cancellation record created for order ID ${order.id} with reason: ${reason}`);
    }
}