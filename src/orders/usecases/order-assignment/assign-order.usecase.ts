import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderAssignment } from '../../../orders/entities/order-assignment.entity';
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { AssignOrderDto } from '../../dto/assign-order.dto';
import { Order } from '../../entities/order.entity';

@Injectable()
export class AssignOrderUseCase {
  private readonly logger = new Logger(AssignOrderUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderAssignment)
    private readonly orderAssignmentRepository: Repository<OrderAssignment>,
  ) { }

  async execute(
    bakerId: string,
    assignOrderDto: AssignOrderDto,
    user: User,
  ): Promise<OrderAssignment> {
    const { orderId, assignedDate = new Date(), notes } = assignOrderDto;

    const baker = await this.userRepository.findOne({
      where: { id: bakerId, role: UserRoles.BAKER },
    });

    if (!baker) {
      this.logger.warn(`Baker with identifier "${bakerId}" not found`);
      throw new BadRequestException(
        `Baker with identifier "${bakerId}" not found`,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      this.logger.warn(`Order with identifier "${orderId}" not found`);
      throw new BadRequestException(
        `Order with identifier "${orderId}" not found`,
      );
    }

    const isAssigned = await this.orderAssignmentRepository.findOne({
      where: {
        order: { id: orderId },
      },
    });

    if (isAssigned) {
      this.logger.warn(
        `Order with identifier "${orderId}" is already assigned`,
      );
      throw new BadRequestException(
        `Order with identifier "${orderId}" is already assigned`,
      );
    }

    const assignment = this.orderAssignmentRepository.create({
      baker,
      order,
      assignedDate,
      notes,
      createdBy: user,
      updatedBy: user,
    });

    const savedAssignment =
      await this.orderAssignmentRepository.save(assignment);

    this.logger.log(
      `Order with identifier "${orderId}" assigned to baker "${bakerId}" successfully`,
    );

    return savedAssignment;
  }
}
