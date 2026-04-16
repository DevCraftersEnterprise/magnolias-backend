import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { PaginationResponse } from '../../../common/responses/pagination.response';
import { OrdersRangeFilterDto } from '../../dto/orders-range-filter.dto';
import { Order } from '../../entities/order.entity';

@Injectable()
export class FindAllOrdersByRangeUseCase {
  private readonly logger = new Logger(FindAllOrdersByRangeUseCase.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async execute(
    ordersRangeFilterDto: OrdersRangeFilterDto,
    branchId: string,
  ): Promise<PaginationResponse<Order> | Order[]> {
    const { orderStatus, startDate, endDate, limit, offset } =
      ordersRangeFilterDto;

    const whereConditions: FindOptionsWhere<Order> = {
      branch: { id: branchId },
      status: orderStatus ? orderStatus : undefined,
      deliveryDate:
        startDate && endDate ? Between(startDate, endDate) : undefined,
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
        deliveryTime: true,
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
      order: { createdAt: 'DESC' },
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

    this.logger.log(
      `Found ${orders.length} orders matching filters without pagination`,
    );

    return orders;
  }
}
