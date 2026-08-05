import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersFilterDto } from '../../dto/orders-filter.dto';
import { PaginationResponse } from '../../../common/responses/pagination.response';

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

/**
 * Resumen liviano de asignación de reposteros por línea, para no cargar el
 * baker completo por cada detalle en un listado paginado.
 */
function attachAssignmentRollup(orders: Order[]): void {
  for (const order of orders) {
    order.totalLinesCount = order.details?.length ?? 0;
    order.assignedBakersCount =
      order.details?.filter((d) => (d.assignments?.length ?? 0) > 0)
        .length ?? 0;
  }
}

@Injectable()
export class FindAllOrdersUseCase {
  private readonly logger = new Logger(FindAllOrdersUseCase.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  async execute(
    ordersFilterDto: OrdersFilterDto,
    branchId: string,
  ): Promise<PaginationResponse<Order> | Order[]> {
    const {
      name,
      orderStatus,
      clientPhone,
      orderDate,
      limit,
      offset,
      startDate,
      endDate
    } = ordersFilterDto;

    if (orderDate && (startDate || endDate)) {
      throw new BadRequestException(
        'orderDate cannot be combined with startDate/endDate; use either an exact date or a range'
      );
    }

    if ((startDate && !endDate) || (!startDate && endDate)) {
      throw new BadRequestException(
        'startDate and endDate must be provided together'
      );
    }

    const whereConditions: FindOptionsWhere<Order> = {
      branch: { id: branchId },
      customer: {
        fullName: name ? ILike(`%${name}%`) : undefined,
        phone: clientPhone ? clientPhone : undefined,
      },
      status: orderStatus ? orderStatus : undefined,
      deliveryDate: orderDate
        ? Between(startOfUtcDay(orderDate), endOfUtcDay(orderDate))
        : undefined,
    };

    if (startDate && endDate) {
      const rangeStart = startOfUtcDay(startDate);
      const rangeEnd = endOfUtcDay(endDate);

      if (rangeStart > rangeEnd) {
        throw new BadRequestException(
          'startDate must be before or equal to endDate'
        );
      }

      whereConditions.deliveryDate = Between(rangeStart, rangeEnd);
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereConditions,
      relations: {
        customer: true,
        deliveryAddress: true,
        createdBy: true,
        updatedBy: true,
        details: {
          assignments: true,
        },
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
        details: {
          id: true,
          assignments: {
            id: true,
          },
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

    attachAssignmentRollup(orders);

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
