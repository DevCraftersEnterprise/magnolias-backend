import { Injectable, Logger } from "@nestjs/common";
import { Order } from '../../entities/order.entity';
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OrdersFilterDto } from '../../dto/orders-filter.dto';
import { PaginationResponse } from '../../../common/responses/pagination.response';

@Injectable()
export class FindAllOrdersUseCase {
    private readonly logger = new Logger(FindAllOrdersUseCase.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async execute(ordersFilterDto: OrdersFilterDto, branchId: string): Promise<PaginationResponse<Order> | Order[]> {
        const { name, orderStatus, clientPhone, orderDate, limit, offset } = ordersFilterDto;

        const whereConditions: FindOptionsWhere<Order> = {
            branch: { id: branchId },
            customer: {
                fullName: name ? ILike(`%${name}%`) : undefined,
                phone: clientPhone ? clientPhone : undefined,
            },
            status: orderStatus ? orderStatus : undefined,
            deliveryDate: orderDate ? orderDate : undefined,
        };

        const [orders, total] = await this.orderRepository.findAndCount({
            where: whereConditions,
            relations: {
                customer: true,
                deliveryAddress: true,
                createdBy: true,
                updatedBy: true,
            },
            select: {
                id: true,
                orderCode: true,
                deliveryDate: true,
                status: true,
                totalAmount: true,
                advancePayment: true,
                remainingBalance: true,
                createdAt: true,
                updatedAt: true,
                deliveryAddress: {
                    id: true,
                    street: true,
                    number: true,
                    neighborhood: true,
                    city: true,
                    receiverName: true,
                    receiverPhone: true,
                    deliveryNotes: true,
                },
                customer: {
                    id: true,
                    fullName: true,
                    phone: true,
                },
                createdBy: {
                    name: true,
                    lastname: true,
                },
                updatedBy: {
                    name: true,
                    lastname: true,
                },
            },
            skip: offset,
            take: limit,
            order: { deliveryDate: 'DESC' },
        });

        if (limit !== undefined && offset !== undefined) {
            this.logger.log(`Found ${total} orders matching filters with pagination`);

            return {
                items: orders,
                total,
                pagination: {
                    limit,
                    offset,
                    currentPage: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }

        this.logger.log(`Found ${orders.length} orders matching filters without pagination`);

        return orders;
    }
}