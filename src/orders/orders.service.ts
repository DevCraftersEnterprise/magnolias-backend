import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from 'src/users/enums/user-role';
import { Repository } from 'typeorm';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { AssignOrderDto } from './dto/assign-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatsDto } from './dto/order-stats.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { SetPickupPersonDto } from './dto/set-pickup-person.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderAssignment } from './entities/order-assignment.entity';
import { OrderCancellation } from './entities/order-cancellation.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { AssignOrderUseCase } from './usecases/order-assignment/assign-order.usecase';
import { GetAssignmentsUseCase } from './usecases/order-assignment/get-assignments.usecase';
import { CreateOrderUseCase } from './usecases/order/create-order.usecase';
import { FindAllOrdersUseCase } from './usecases/order/find-all-orders.usecase';
import { FindOneOrderUseCase } from './usecases/order/find-one-order.usecase';
import { SetPickupPersonUseCase } from './usecases/order/set-pickup-person.usecase';
import { UpdateOrderUseCase } from './usecases/order/update-order.usecase';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderCancellation)
    private readonly cancellationRepository: Repository<OrderCancellation>,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly setPickupPersonUseCase: SetPickupPersonUseCase,
    private readonly findAllOrdersUseCase: FindAllOrdersUseCase,
    private readonly findOneOrderUseCase: FindOneOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly assignOrderUseCase: AssignOrderUseCase,
    private readonly getAssignmentsUseCase: GetAssignmentsUseCase,
  ) { }

  async createOrder(dto: CreateOrderDto, user: User, referenceImages?: Express.Multer.File[]): Promise<Order> {
    return await this.createOrderUseCase.execute(dto, user, referenceImages);
  }

  async setPickupPerson(orderId: string, setPickupPersonDto: SetPickupPersonDto, user: User,): Promise<Order> {
    return await this.setPickupPersonUseCase.execute(orderId, setPickupPersonDto, user);
  }

  async getOrders(filter: OrdersFilterDto, branchId: string,): Promise<PaginationResponse<Order> | Order[]> {
    return await this.findAllOrdersUseCase.execute(filter, branchId);
  }

  async getOrderByTerm(term: string): Promise<Order> {
    return await this.findOneOrderUseCase.execute(term);
  }

  async updateOrder(dto: UpdateOrderDto, user: User): Promise<Order> {
    return await this.updateOrderUseCase.execute(dto, user);
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

  async markOrderAsDelivered(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.DELIVERED;
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

  async getStats(user: User, branchId?: string): Promise<OrderStatsDto> {
    const query = this.orderRepository.createQueryBuilder('order');
    console.log('User role:', user.role);
    if (user.role === UserRoles.ADMIN) {
      if (branchId) {
        query.andWhere('order.branchId = :branchId', { branchId });
      }
    } else {
      query.andWhere('order.branchId = :branchId', { branchId: user.branch?.id });
    }

    const orders = await query.getMany();

    const stats: OrderStatsDto = {
      total: orders.length,
      statuses: {
        created: orders.filter(o => o.status === OrderStatus.CREATED).length,
        in_process: orders.filter(o => o.status === OrderStatus.IN_PROCESS).length,
        done: orders.filter(o => o.status === OrderStatus.DONE).length,
        cancelled: orders.filter(o => o.status === OrderStatus.CANCELED).length,
      }
    };

    return stats;
  }

  async assignOrder(bakerId: string, assignOrderDto: AssignOrderDto, user: User,): Promise<OrderAssignment> {
    return await this.assignOrderUseCase.execute(bakerId, assignOrderDto, user);
  }

  async getAssignments(bakerId: string): Promise<OrderAssignment[]> {
    return await this.getAssignmentsUseCase.execute(bakerId);
  }

}
