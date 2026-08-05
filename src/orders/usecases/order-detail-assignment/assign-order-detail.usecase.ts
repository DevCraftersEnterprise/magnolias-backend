import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { AssignOrderDetailDto } from '../../dto/assign-order-detail.dto';
import { OrderDetailAssignment } from '../../entities/order-detail-assignment.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { OrderStatus } from '../../enums/order-status.enum';

@Injectable()
export class AssignOrderDetailUseCase {
  private readonly logger = new Logger(AssignOrderDetailUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(OrderDetailAssignment)
    private readonly orderDetailAssignmentRepository: Repository<OrderDetailAssignment>,
  ) {}

  async execute(
    orderDetailId: string,
    dto: AssignOrderDetailDto,
    user: User,
  ): Promise<OrderDetailAssignment> {
    const { bakerId, assignedDate = new Date(), notes } = dto;

    const orderDetail = await this.orderDetailRepository.findOne({
      where: { id: orderDetailId },
      relations: { order: { branch: true } },
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
        `Order detail ${orderDetailId} cannot be assigned because its order's status is ${orderDetail.order.status}`,
      );
      throw new BadRequestException(
        `Order detail cannot be assigned because its order's status is ${orderDetail.order.status}`,
      );
    }

    const baker = await this.userRepository.findOne({
      where: { id: bakerId, role: UserRoles.BAKER },
      relations: { branches: true },
    });

    if (!baker) {
      this.logger.warn(`Baker with identifier "${bakerId}" not found`);
      throw new BadRequestException(
        `Baker with identifier "${bakerId}" not found`,
      );
    }

    const hasAccessToBranch = baker.branches?.some(
      (branch) => branch.id === orderDetail.order.branch.id,
    );
    if (!hasAccessToBranch) {
      this.logger.warn(
        `Baker ${bakerId} does not belong to branch ${orderDetail.order.branch.id}`,
      );
      throw new BadRequestException(
        `Baker ${bakerId} does not belong to the order's branch`,
      );
    }

    const existingAssignment = await this.orderDetailAssignmentRepository.findOne({
      where: { orderDetail: { id: orderDetailId } },
    });

    if (existingAssignment) {
      existingAssignment.baker = baker;
      existingAssignment.assignedDate = assignedDate;
      existingAssignment.notes = notes;
      existingAssignment.updatedBy = user;

      const updated = await this.orderDetailAssignmentRepository.save(
        existingAssignment,
      );

      this.logger.log(
        `Order detail "${orderDetailId}" reassigned to baker "${bakerId}" successfully`,
      );

      return updated;
    }

    const assignment = this.orderDetailAssignmentRepository.create({
      baker,
      orderDetail,
      assignedDate,
      notes,
      createdBy: user,
      updatedBy: user,
    });

    const saved = await this.orderDetailAssignmentRepository.save(assignment);

    this.logger.log(
      `Order detail "${orderDetailId}" assigned to baker "${bakerId}" successfully`,
    );

    return saved;
  }
}
