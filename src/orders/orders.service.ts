import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BranchesService } from '../branches/branches.service';
import { ColorsService } from '../colors/colors.service';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderCancellation } from './entities/order-cancellation.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(OrderCancellation)
    private readonly cancellationRepository: Repository<OrderCancellation>,
    private readonly branchesService: BranchesService,
    private readonly colorsService: ColorsService,
  ) {}

  async createOrder(dto: CreateOrderDto, user: User): Promise<Order> {
    const { clientName, clientPhone, deliveryDate, branchId, details } = dto;

    const branch = await this.branchesService.findBranchByTerm(branchId);

    if (!branch) throw new NotFoundException('Branch not found');

    const orderData = this.orderRepository.create({
      clientName,
      clientPhone,
      deliveryDate,
      status: OrderStatus.CREATED,
      branch,
      createdBy: user,
      updatedBy: user,
    });

    const order = await this.orderRepository.save(orderData);

    await this.createOrderDetails(order, details);

    return await this.getOrderByTerm(order.id);
  }

  async getOrders(
    filter: OrdersFilterDto,
    branchId: string,
  ): Promise<PaginationResponse<Order>> {
    const {
      name,
      orderStatus,
      clientPhone,
      orderDate,
      limit = 10,
      offset = 0,
    } = filter;

    const whereConditions: FindOptionsWhere<Order> = {};

    if (name) whereConditions.clientName = ILike(`%${name}%`);
    if (clientPhone) whereConditions.clientPhone = clientPhone;
    if (orderStatus) whereConditions.status = orderStatus;
    if (orderDate) whereConditions.deliveryDate = orderDate;

    whereConditions.branch = { id: branchId };

    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereConditions,
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        deliveryDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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

  async getOrderByTerm(term: string): Promise<Order> {
    if (!isUUID(term)) throw new BadRequestException('Invalid UUID format');

    const order = await this.orderRepository.findOne({
      where: { id: term },
      relations: {
        branch: true,
        createdBy: true,
        updatedBy: true,
        details: true,
      },
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        deliveryDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          name: true,
          address: true,
        },
        createdBy: {
          name: true,
          lastname: true,
        },
        updatedBy: {
          name: true,
          lastname: true,
        },
        details: {
          id: true,
          product: {
            name: true,
            description: true,
          },
          quantity: true,
          price: true,
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async updateOrder(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id, clientName, clientPhone, deliveryDate } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.CREATED) {
      throw new BadRequestException(
        'Only orders with status CREATED can be updated',
      );
    }

    if (clientName) order.clientName = clientName;
    if (clientPhone) order.clientPhone = clientPhone;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  async markOrderAsInProcess(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.IN_PROCESS;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  async markOrderAsDone(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.DONE;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  async markOrderAsCancel(dto: CancelOrderDto, user: User): Promise<Order> {
    const { id, reason } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    const alreadyCanceled = await this.cancellationRepository.findOne({
      where: { order },
    });

    if (alreadyCanceled) {
      throw new BadRequestException('This order has already been canceled');
    }

    const cancellation = this.cancellationRepository.create({
      order,
      description: reason,
      canceledBy: user,
    });

    await this.cancellationRepository.save(cancellation);

    order.status = OrderStatus.CANCELED;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  private async createOrderDetails(
    order: Order,
    details: CreateOrderDetailDto[],
  ): Promise<void> {
    const { createdBy, updatedBy } = order;

    const colors = await this.colorsService.findAll();

    const orderDetails = details.map((detail) =>
      this.orderDetailRepository.create({
        color: colors.find((color) => color.id === detail.colorId),
        createdBy,
        updatedBy,
        order,
        notes: detail.notes,
        price: detail.price,
        quantity: detail.quantity,
        product: { id: detail.productId },
      }),
    );

    await this.orderDetailRepository.save(orderDetails);
  }
}
