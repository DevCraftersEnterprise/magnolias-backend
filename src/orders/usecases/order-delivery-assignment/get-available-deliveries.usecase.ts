import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';

/**
 * Cliente: pedidos "Listos" (DONE) de la sucursal del repartidor que
 * todavía no tienen repartidor asignado - los que puede tomar.
 */
@Injectable()
export class GetAvailableDeliveriesUseCase {
  private readonly logger = new Logger(GetAvailableDeliveriesUseCase.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async execute(driver: User): Promise<Order[]> {
    const branchIds = driver.branches?.map((branch) => branch.id) ?? [];

    if (branchIds.length === 0) {
      this.logger.warn(
        `Driver ${driver.id} does not have an associated branch`,
      );
      throw new BadRequestException(
        'Driver does not have an associated branch',
      );
    }

    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .leftJoinAndSelect('order.deliveryAddress', 'deliveryAddress')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoin('order.deliveryAssignments', 'deliveryAssignment')
      .where('order.status = :status', { status: OrderStatus.DONE })
      .andWhere('branch.id IN (:...branchIds)', { branchIds })
      .andWhere('deliveryAssignment.id IS NULL')
      .orderBy('order.deliveryDate', 'ASC')
      .getMany();
  }
}
