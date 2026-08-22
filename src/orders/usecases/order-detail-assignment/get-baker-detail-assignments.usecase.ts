import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { OrderDetailAssignment } from '../../entities/order-detail-assignment.entity';
import { OrderStatus } from '../../enums/order-status.enum';

@Injectable()
export class GetBakerDetailAssignmentsUseCase {
  private readonly logger = new Logger(GetBakerDetailAssignmentsUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderDetailAssignment)
    private readonly orderDetailAssignmentRepository: Repository<OrderDetailAssignment>,
  ) {}

  async execute(bakerId: string): Promise<OrderDetailAssignment[]> {
    const baker = await this.userRepository.findOne({
      where: { id: bakerId },
    });

    if (!baker) {
      this.logger.warn(`Baker with identifier "${bakerId}" not found`);
      throw new BadRequestException(
        `Baker with identifier "${bakerId}" not found`,
      );
    }

    const assignments = await this.orderDetailAssignmentRepository.find({
      where: {
        baker: { id: bakerId },
        orderDetail: {
          order: {
            status: In([
              OrderStatus.CREATED,
              OrderStatus.IN_PROCESS,
              OrderStatus.DONE,
            ]),
          },
        },
      },
      relations: {
        orderDetail: {
          order: { branch: true },
          product: true,
          referenceImages: true,
        },
      },
      order: {
        assignedDate: 'DESC',
      },
    });

    return assignments;
  }
}
