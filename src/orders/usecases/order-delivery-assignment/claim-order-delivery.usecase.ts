import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { ClaimOrderDeliveryDto } from '../../dto/claim-order-delivery.dto';
import { Order } from '../../entities/order.entity';
import { OrderDeliveryAssignment } from '../../entities/order-delivery-assignment.entity';
import { OrderStatus } from '../../enums/order-status.enum';

/**
 * Cliente: en vez de que el admin asigne el repartidor, el pedido se
 * muestra a todos los repartidores disponibles de la sucursal y el primero
 * que lo toma se queda con él. Usa un lock pesimista sobre el pedido para
 * que dos repartidores tomando el mismo pedido casi al mismo tiempo no
 * terminen ambos con una asignación (la segunda transacción espera a que
 * la primera confirme, y al reevaluar ve que ya existe la asignación).
 */
@Injectable()
export class ClaimOrderDeliveryUseCase {
  private readonly logger = new Logger(ClaimOrderDeliveryUseCase.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    orderId: string,
    dto: ClaimOrderDeliveryDto,
    driver: User,
  ): Promise<OrderDeliveryAssignment> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager
        .createQueryBuilder(Order, 'order')
        .leftJoinAndSelect('order.branch', 'branch')
        .setLock('pessimistic_write')
        .where('order.id = :orderId', { orderId })
        .getOne();

      if (!order) {
        this.logger.warn(`Order with identifier "${orderId}" not found`);
        throw new NotFoundException(
          `Order with identifier "${orderId}" not found`,
        );
      }

      if (order.status !== OrderStatus.DONE) {
        this.logger.warn(
          `Order ${orderId} cannot be claimed because its status is ${order.status}`,
        );
        throw new BadRequestException(
          'El pedido no está listo para reparto',
        );
      }

      const hasAccessToBranch = driver.branches?.some(
        (branch) => branch.id === order.branch.id,
      );
      if (!hasAccessToBranch) {
        this.logger.warn(
          `Driver ${driver.id} does not belong to branch ${order.branch.id}`,
        );
        throw new BadRequestException(
          'No perteneces a la sucursal de este pedido',
        );
      }

      const existingAssignment = await manager
        .getRepository(OrderDeliveryAssignment)
        .findOne({ where: { order: { id: orderId } } });

      if (existingAssignment) {
        this.logger.warn(
          `Order ${orderId} was already claimed by another driver`,
        );
        throw new ConflictException(
          'Este pedido ya fue tomado por otro repartidor',
        );
      }

      const assignment = manager.getRepository(OrderDeliveryAssignment).create({
        driver,
        order,
        assignedDate: new Date(),
        notes: dto.notes,
        createdBy: driver,
        updatedBy: driver,
      });

      const saved = await manager
        .getRepository(OrderDeliveryAssignment)
        .save(assignment);

      await manager.getRepository(Order).update(orderId, {
        status: OrderStatus.IN_DELIVERY,
        updatedBy: driver,
      });

      this.logger.log(
        `Order "${orderId}" claimed by driver "${driver.id}" successfully`,
      );

      return saved;
    });
  }
}
