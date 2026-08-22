import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { AssignOrderDetailDto } from './dto/assign-order-detail.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { SetPickupPersonDto } from './dto/set-pickup-person.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';
import { OrderDetailAssignment } from './entities/order-detail-assignment.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { OrderStatsResponse } from './responses/order-stats.response';
import { AssignOrderDetailUseCase } from './usecases/order-detail-assignment/assign-order-detail.usecase';
import { GetBakerDetailAssignmentsUseCase } from './usecases/order-detail-assignment/get-baker-detail-assignments.usecase';
import { UpdateProductionStatusUseCase } from './usecases/order-detail-assignment/update-production-status.usecase';
import { ChangeOrderStatusUseCase } from './usecases/order/change-order-status.usecase';
import { CreateOrderUseCase } from './usecases/order/create-order.usecase';
import { FindAllOrdersUseCase } from './usecases/order/find-all-orders.usecase';
import { FindOneOrderUseCase } from './usecases/order/find-one-order.usecase';
import { GetOrderStatsUseCase } from './usecases/order/get-order-stats.usecase';
import { SetPickupPersonUseCase } from './usecases/order/set-pickup-person.usecase';
import { UpdateOrderUseCase } from './usecases/order/update-order.usecase';
import { HideOrderDetailReferenceImageUseCase } from './usecases/order/hide-order-detail-reference-image.usecase';

@Injectable()
export class OrdersService {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly setPickupPersonUseCase: SetPickupPersonUseCase,
    private readonly findAllOrdersUseCase: FindAllOrdersUseCase,
    private readonly findOneOrderUseCase: FindOneOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly changeOrderStatusUseCase: ChangeOrderStatusUseCase,
    private readonly getOrderStatsUseCase: GetOrderStatsUseCase,
    private readonly assignOrderDetailUseCase: AssignOrderDetailUseCase,
    private readonly getBakerDetailAssignmentsUseCase: GetBakerDetailAssignmentsUseCase,
    private readonly updateProductionStatusUseCase: UpdateProductionStatusUseCase,
    private readonly hideOrderDetailReferenceImageUseCase: HideOrderDetailReferenceImageUseCase,
  ) { }

  async createOrder(
    dto: CreateOrderDto,
    user: User,
    referenceImages?: Express.Multer.File[],
  ): Promise<Order> {
    return await this.createOrderUseCase.execute(dto, user, referenceImages);
  }

  async setPickupPerson(
    orderId: string,
    setPickupPersonDto: SetPickupPersonDto,
    user: User,
  ): Promise<Order> {
    return await this.setPickupPersonUseCase.execute(
      orderId,
      setPickupPersonDto,
      user,
    );
  }

  async getOrders(
    filter: OrdersFilterDto,
    branchId: string,
  ): Promise<PaginationResponse<Order> | Order[]> {
    return await this.findAllOrdersUseCase.execute(filter, branchId);
  }

  async getOrderByTerm(
    term: string,
    includeTransferAccount = false,
  ): Promise<Order> {
    return await this.findOneOrderUseCase.execute(term, includeTransferAccount);
  }

  async updateOrder(
    dto: UpdateOrderDto,
    user: User,
    referenceImages?: Express.Multer.File[],
  ): Promise<Order> {
    return await this.updateOrderUseCase.execute(dto, user, referenceImages);
  }

  async hideOrderDetailReferenceImage(id: string, user: User): Promise<void> {
    return await this.hideOrderDetailReferenceImageUseCase.execute(id, user);
  }

  async markOrderAsInProcess(dto: UpdateOrderDto, user: User): Promise<Order> {
    return await this.changeOrderStatusUseCase.execute(
      dto,
      OrderStatus.IN_PROCESS,
      user,
    );
  }

  async markOrderAsDone(dto: UpdateOrderDto, user: User): Promise<Order> {
    return await this.changeOrderStatusUseCase.execute(
      dto,
      OrderStatus.DONE,
      user,
    );
  }

  async markOrderAsDelivered(dto: UpdateOrderDto, user: User): Promise<Order> {
    return await this.changeOrderStatusUseCase.execute(
      dto,
      OrderStatus.DELIVERED,
      user,
    );
  }

  async markOrderAsCancel(dto: CancelOrderDto, user: User): Promise<Order> {
    return await this.changeOrderStatusUseCase.execute(
      dto,
      OrderStatus.CANCELED,
      user,
      dto,
    );
  }

  async getStats(user: User, branchId?: string): Promise<OrderStatsResponse> {
    return await this.getOrderStatsUseCase.execute(user, branchId);
  }

  async assignOrderDetail(
    orderDetailId: string,
    assignOrderDetailDto: AssignOrderDetailDto,
    user: User,
  ): Promise<OrderDetailAssignment> {
    return await this.assignOrderDetailUseCase.execute(
      orderDetailId,
      assignOrderDetailDto,
      user,
    );
  }

  async getBakerDetailAssignments(
    bakerId: string,
  ): Promise<OrderDetailAssignment[]> {
    return await this.getBakerDetailAssignmentsUseCase.execute(bakerId);
  }

  async updateProductionStatus(
    orderDetailId: string,
    updateProductionStatusDto: UpdateProductionStatusDto,
    user: User,
  ): Promise<OrderDetail> {
    return await this.updateProductionStatusUseCase.execute(
      orderDetailId,
      updateProductionStatusDto,
      user,
    );
  }
}
