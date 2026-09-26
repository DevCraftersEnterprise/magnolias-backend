import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { AssignOrderDeliveryDto } from '../../dto/assign-order-delivery.dto';
import { OrderDeliveryAssignment } from '../../entities/order-delivery-assignment.entity';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';

@Injectable()
export class AssignOrderDeliveryUseCase {
  private readonly logger = new Logger(AssignOrderDeliveryUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDeliveryAssignment)
    private readonly orderDeliveryAssignmentRepository: Repository<OrderDeliveryAssignment>,
  ) {}

  async execute(
    orderId: string,
    dto: AssignOrderDeliveryDto,
    user: User,
  ): Promise<OrderDeliveryAssignment> {
    const { driverId, assignedDate = new Date(), notes } = dto;

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { branch: true },
    });

    if (!order) {
      this.logger.warn(`Order with identifier "${orderId}" not found`);
      throw new BadRequestException(
        `Order with identifier "${orderId}" not found`,
      );
    }

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELED
    ) {
      this.logger.warn(
        `Order ${orderId} cannot be assigned because its status is ${order.status}`,
      );
      throw new BadRequestException(
        `Order cannot be assigned because its status is ${order.status}`,
      );
    }

    const driver = await this.userRepository.findOne({
      where: { id: driverId, role: UserRoles.DRIVER },
      relations: { branches: true },
    });

    if (!driver) {
      this.logger.warn(`Driver with identifier "${driverId}" not found`);
      throw new BadRequestException(
        `Driver with identifier "${driverId}" not found`,
      );
    }

    const hasAccessToBranch = driver.branches?.some(
      (branch) => branch.id === order.branch.id,
    );
    if (!hasAccessToBranch) {
      this.logger.warn(
        `Driver ${driverId} does not belong to branch ${order.branch.id}`,
      );
      throw new BadRequestException(
        `Driver ${driverId} does not belong to the order's branch`,
      );
    }

    const existingAssignment = await this.orderDeliveryAssignmentRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (existingAssignment) {
      existingAssignment.driver = driver;
      existingAssignment.assignedDate = assignedDate;
      existingAssignment.notes = notes;
      existingAssignment.updatedBy = user;

      const updated = await this.orderDeliveryAssignmentRepository.save(
        existingAssignment,
      );

      this.logger.log(
        `Order "${orderId}" reassigned to driver "${driverId}" successfully`,
      );

      return updated;
    }

    const assignment = this.orderDeliveryAssignmentRepository.create({
      driver,
      order,
      assignedDate,
      notes,
      createdBy: user,
      updatedBy: user,
    });

    const saved = await this.orderDeliveryAssignmentRepository.save(assignment);

    this.logger.log(
      `Order "${orderId}" assigned to driver "${driverId}" successfully`,
    );

    return saved;
  }
}
