import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../users/entities/user.entity';
import { sanitizeUser } from '../../../users/utils/sanitized-user.util';
import { sanitizeBranchEmployee } from '../../../branch-employees/utils/sanitized-branch-employee.util';

@Injectable()
export class FindOneOrderUseCase {
  private readonly logger = new Logger(FindOneOrderUseCase.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  /**
   * @param includeTransferAccount - `transferAccount` holds a bank
   * account/reference number and must stay out of the normal admin UI
   * (list/detail screens) — it's only meant to be printed on the PDF
   * report. Defaults to `false`; only the PDF-generation path
   * (`FormatsService`) should pass `true`.
   */
  async execute(
    term: string,
    includeTransferAccount = false,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: term },
      relations: {
        customer: { address: true },
        branch: true,
        deliveryAddress: true,
        details: {
          product: {
            category: true,
          },
          frosting: true,
          breadType: true,
          style: true,
          filling: true,
          color: true,
          referenceImages: true,
          discountAuthorizedBy: true,
          tiers: {
            breadType: true,
            filling: true,
            frosting: true,
            color: true,
            style: true,
          },
          assignments: {
            baker: true,
          },
        },
        orderFlowers: {
          flower: true,
          color: true,
        },
        payments: true,
        createdBy: true,
        updatedBy: true,
        employeeActions: {
          employee: true,
        },
        deliveryAssignments: {
          driver: true,
        },
      },
      order: {
        payments: {
          createdAt: 'DESC',
        },
        employeeActions: {
          performedAt: 'DESC',
        },
      },
    });

    if (!order) {
      this.logger.warn(`Order with ID ${term} not found`);
      throw new NotFoundException(`Order with ID ${term} not found`);
    }

    if (!includeTransferAccount) {
      order.transferAccount = undefined;
    }

    // Este proyecto no registra un ClassSerializerInterceptor global, así
    // que @Exclude()/@ApiHideProperty() en User.userkey y BranchEmployee.pin
    // no ocultan nada por sí solos: hay que sanear a mano cada relación de
    // usuario/empleado que viaje en la respuesta de un pedido.
    if (order.createdBy) {
      order.createdBy = sanitizeUser(order.createdBy) as User;
    }
    if (order.updatedBy) {
      order.updatedBy = sanitizeUser(order.updatedBy) as User;
    }
    if (order.employeeActions) {
      order.employeeActions = order.employeeActions.map((action) => ({
        ...action,
        employee: sanitizeBranchEmployee(action.employee),
      })) as typeof order.employeeActions;
    }
    if (order.deliveryAssignments) {
      order.deliveryAssignments = order.deliveryAssignments.map(
        (assignment) => ({
          ...assignment,
          driver: sanitizeUser(assignment.driver) as User,
        }),
      ) as typeof order.deliveryAssignments;
    }
    if (order.details) {
      order.details = order.details.map((detail) => ({
        ...detail,
        discountAuthorizedBy: detail.discountAuthorizedBy
          ? (sanitizeUser(detail.discountAuthorizedBy) as User)
          : detail.discountAuthorizedBy,
        assignments: detail.assignments?.map((assignment) => ({
          ...assignment,
          baker: sanitizeUser(assignment.baker) as User,
        })),
      })) as typeof order.details;
    }

    return order;
  }
}
