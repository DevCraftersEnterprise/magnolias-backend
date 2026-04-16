import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderAssignment } from '../../../orders/entities/order-assignment.entity';
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { AssignOrderDto } from '../../dto/assign-order.dto';
import { OrderStatus } from '../../enums/order-status.enum';

@Injectable()
export class UpdateAssignOrderUseCase {
  private readonly logger = new Logger(UpdateAssignOrderUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderAssignment)
    private readonly orderAssignmentRepository: Repository<OrderAssignment>,
  ) {}

  async execute(
    bakerId: string,
    assignOrderDto: AssignOrderDto,
    user: User,
  ): Promise<OrderAssignment> {
    const { orderId, notes, assignedDate } = assignOrderDto;

    const baker = await this.userRepository.findOne({
      where: { id: bakerId, role: UserRoles.BAKER },
      relations: ['branches'],
    });

    if (!baker) {
      this.logger.warn(`Baker with identifier "${bakerId}" not found`);
      throw new BadRequestException(
        `Baker with identifier "${bakerId}" not found`,
      );
    }

    const assignment  = await this.orderAssignmentRepository.findOne({
      where: {
        order: { id: orderId },
      },
      relations: ['order', 'order.branch', 'baker'],
    });

    if (!assignment) {
      this.logger.warn(`Assignment for order "${orderId}" not found`);
        throw new BadRequestException(
        `Assignment for order "${orderId}" not found`,
        );
    }
    if (assignment.order.status !== OrderStatus.CREATED) {
        this.logger.warn(
            `Order ${orderId} cannot be reassigned because its status is ${assignment.order.status}`,
        );

        throw new BadRequestException(
            `Order ${orderId} cannot be reassigned because its status is ${assignment.order.status}`,
        );
    }
    if (assignment.baker.id === bakerId) {
        throw new BadRequestException(
        `Order already assigned to this baker`,
        );
    }

    const hasAccessToBranch = baker.branches?.some(
        (branch) => branch.id === assignment.order.branch.id,
    );
    if (!hasAccessToBranch) {
        this.logger.warn(
        `Baker ${bakerId} does not belong to branch ${assignment.order.branch.id}`,
        );
        throw new BadRequestException(
        `Baker ${bakerId} does not belong to the order's branch`,
        );
    }
    assignment.baker = baker;

    if (notes) {
        assignment.notes = notes;
    }

    if (assignedDate) {
        assignment.assignedDate = assignedDate;
    }

    assignment.updatedBy = user;
    
    const updatedAssignment = await this.orderAssignmentRepository.save(assignment);

    this.logger.log(
        `Order with identifier "${orderId}" reassigned to baker "${bakerId}" successfully`,
    );

    return updatedAssignment;
  }
}
