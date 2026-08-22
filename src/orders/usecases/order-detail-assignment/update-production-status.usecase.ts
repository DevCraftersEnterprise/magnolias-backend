import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { UpdateProductionStatusDto } from '../../dto/update-production-status.dto';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { computeDerivedOrderStatus } from '../../utils/recompute-order-status.util';

@Injectable()
export class UpdateProductionStatusUseCase {
  private readonly logger = new Logger(UpdateProductionStatusUseCase.name);

  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(
    orderDetailId: string,
    dto: UpdateProductionStatusDto,
    user: User,
  ): Promise<OrderDetail> {
    const orderDetail = await this.orderDetailRepository.findOne({
      where: { id: orderDetailId },
      relations: {
        order: { branch: true, details: true },
        assignments: { baker: true },
      },
    });

    if (!orderDetail) {
      this.logger.warn(`Order detail with identifier "${orderDetailId}" not found`);
      throw new BadRequestException(
        `Order detail with identifier "${orderDetailId}" not found`,
      );
    }

    if (
      orderDetail.order.status === OrderStatus.DELIVERED ||
      orderDetail.order.status === OrderStatus.CANCELED
    ) {
      this.logger.warn(
        `Order detail ${orderDetailId} cannot advance because its order's status is ${orderDetail.order.status}`,
      );
      throw new BadRequestException(
        `Order detail cannot advance because its order's status is ${orderDetail.order.status}`,
      );
    }

    await this.authorize(orderDetail, user);

    orderDetail.productionStatus = dto.status;
    const savedDetail = await this.orderDetailRepository.save(orderDetail);

    await this.recomputeOrderStatus(orderDetail.order.id);

    this.logger.log(
      `Order detail "${orderDetailId}" production status set to "${dto.status}"`,
    );

    return savedDetail;
  }

  private async authorize(orderDetail: OrderDetail, user: User): Promise<void> {
    if (user.role === UserRoles.SUPER || user.role === UserRoles.ADMIN) {
      return;
    }

    if (user.role !== UserRoles.BAKER) {
      throw new ForbiddenException(
        'You are not allowed to advance this order detail',
      );
    }

    const assignedBaker = orderDetail.assignments?.[0]?.baker;

    if (assignedBaker) {
      if (assignedBaker.id !== user.id) {
        throw new ForbiddenException(
          'Only the baker assigned to this line can advance it',
        );
      }
      return;
    }

    // Sin asignación todavía: cualquier repostero de la sucursal puede tomarla.
    const baker = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { branches: true },
    });
    const hasAccessToBranch = baker?.branches?.some(
      (branch) => branch.id === orderDetail.order.branch.id,
    );
    if (!hasAccessToBranch) {
      throw new ForbiddenException(
        'You do not belong to this order detail branch',
      );
    }
  }

  private async recomputeOrderStatus(orderId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { details: true },
    });

    if (!order) return;

    const derivedStatus = computeDerivedOrderStatus(
      order.status,
      order.details.map((d) => d.productionStatus),
    );

    if (derivedStatus !== order.status) {
      order.status = derivedStatus;
      await this.orderRepository.save(order);
    }
  }
}
