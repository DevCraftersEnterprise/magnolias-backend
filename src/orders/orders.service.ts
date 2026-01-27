import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BranchesService } from '../branches/branches.service';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { isUUID } from 'class-validator';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly branchesService: BranchesService,
  ) {}

  async createOrder(dto: CreateOrderDto, user: User): Promise<Order> {
    const { clientName, clientPhone, deliveryDate, status, branchId } = dto;

    const branch = await this.branchesService.findBranchByTerm(branchId);

    if (!branch) throw new NotFoundException('Branch not found');

    const orderData = this.orderRepository.create({
      clientName,
      clientPhone,
      deliveryDate,
      status,
      branch,
      createdBy: user,
      updatedBy: user,
    });

    return this.orderRepository.save(orderData);
  }

  async getOrders(
    filter: FilterDto,
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
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async updateOrder(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id, status, clientName, clientPhone, deliveryDate } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    if (status) order.status = status;
    if (clientName) order.clientName = clientName;
    if (clientPhone) order.clientPhone = clientPhone;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  async cancelOrder(dto: CancelOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.CANCELED;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    // TODO: Logica de creacion de registro en tabla de cancelaciones

    return this.getOrderByTerm(id);
  }
}
