import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../../users/entities/user.entity';
import { SetPickupPersonDto } from '../../dto/set-pickup-person.dto';
import { Order } from '../../entities/order.entity';

@Injectable()
export class SetPickupPersonUseCase {
    private readonly logger = new Logger(SetPickupPersonUseCase.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async execute(orderId: string, setPickupPersonDto: SetPickupPersonDto, user: User): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: { deliveryAddress: true }
        });

        if (!order) {
            this.logger.warn(`Order with ID ${orderId} not found`);
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        if (!order.deliveryAddress) {
            this.logger.warn(`Order with ID ${orderId} does not have a delivery address`);
            throw new BadRequestException(`Order with ID ${orderId} does not have a delivery address`);
        }

        this.logger.log(`Setting pickup person for order ${orderId}`);

        order.deliveryAddress.receiverName = setPickupPersonDto.pickupPersonName;
        order.deliveryAddress.receiverPhone = setPickupPersonDto.pickupPersonPhone;
        order.updatedBy = user;

        await this.orderRepository.save(order);

        return order;
    }
}