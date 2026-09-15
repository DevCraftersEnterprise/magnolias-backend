import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { OrderDeliveryAssignment } from '../../entities/order-delivery-assignment.entity';
import { OrderStatus } from '../../enums/order-status.enum';

@Injectable()
export class GetDriverAssignmentsUseCase {
  private readonly logger = new Logger(GetDriverAssignmentsUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderDeliveryAssignment)
    private readonly orderDeliveryAssignmentRepository: Repository<OrderDeliveryAssignment>,
  ) {}

  async execute(driverId: string): Promise<OrderDeliveryAssignment[]> {
    const driver = await this.userRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      this.logger.warn(`Driver with identifier "${driverId}" not found`);
      throw new BadRequestException(
        `Driver with identifier "${driverId}" not found`,
      );
    }

    const assignments = await this.orderDeliveryAssignmentRepository.find({
      where: {
        driver: { id: driverId },
        order: {
          status: In([
            OrderStatus.CREATED,
            OrderStatus.IN_PROCESS,
            OrderStatus.DONE,
          ]),
        },
      },
      relations: {
        order: {
          branch: true,
          details: { product: true },
        },
      },
      order: {
        assignedDate: 'DESC',
      },
    });

    return assignments;
  }
}
