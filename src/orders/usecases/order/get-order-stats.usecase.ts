import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { OrderStatsResponse } from '../../responses/order-stats.response';

@Injectable()
export class GetOrderStatsUseCase {
    private readonly logger = new Logger(GetOrderStatsUseCase.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async execute(user: User, branchId?: string): Promise<OrderStatsResponse> {
        this.logger.log(`Getting order stats for user ${user.id} with role ${user.role} and branchId ${branchId}`);

        let filterBranchId: string | undefined;

        if (user.role === UserRoles.ADMIN || user.role === UserRoles.SUPER) {
            filterBranchId = branchId;
        } else {
            if (!user.branch.id) {
                this.logger.error(`User ${user.id} does not have an associated branch`);
                throw new BadRequestException('User does not have an associated branch');
            }

            filterBranchId = user.branch.id;
        }

        const whereConditions: FindOptionsWhere<Order> = {};

        if (filterBranchId) whereConditions.branch = { id: filterBranchId }

        const [orders, total] = await this.orderRepository.findAndCount({
            where: whereConditions
        });

        const stats: OrderStatsResponse = {
            total,
            data: {
                created: orders.filter(order => order.status === OrderStatus.CREATED).length,
                in_process: orders.filter(order => order.status === OrderStatus.IN_PROCESS).length,
                done: orders.filter(order => order.status === OrderStatus.DONE).length,
                delivered: orders.filter(order => order.status === OrderStatus.DELIVERED).length,
                cancelled: orders.filter(order => order.status === OrderStatus.CANCELED).length
            }
        };

        this.logger.log(`Order stats fetched successfully for branch ${filterBranchId || 'all branches'}`);

        return stats;
    }
}