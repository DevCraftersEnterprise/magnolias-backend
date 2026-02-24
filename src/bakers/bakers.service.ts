import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationResponse } from '@/common/responses/pagination.response';
import { OrdersService } from '@/orders/orders.service';
import { OrderStatus } from '@/orders/enums/order-status.enum';

import { User } from '@/users/entities/user.entity';

import { Baker } from '@/bakers/entities/baker.entity';
import { OrderAssignment } from '@/bakers/entities/order-assignment.entity';

import { BakersFilterDto } from '@/bakers/dto/bakers-filter.dto';
import { CreateBakerDto } from '@/bakers/dto/create-baker.dto';
import { UpdateBakerDto } from '@/bakers/dto/update-baker.dto';
import { AssignOrderDto } from '@/bakers/dto/assign-order.dto';

import { CreateBakerUseCase } from '@/bakers/usecases/create-baker.usecase';
import { FindAllBakersUseCase } from '@/bakers/usecases/find-all-bakers.usecase';
import { FindOneBakerUseCase } from '@/bakers/usecases/find-one-baker.usecase';
import { UpdateBakerUseCase } from '@/bakers/usecases/update-baker.usecase';
import { RemoveBakerUseCase } from '@/bakers/usecases/remove-baker.usecase';

@Injectable()
export class BakersService {
  constructor(
    @InjectRepository(Baker)
    private readonly bakerRepository: Repository<Baker>,
    @InjectRepository(OrderAssignment)
    private readonly orderAssignmentRepository: Repository<OrderAssignment>,
    private readonly orderService: OrdersService,

    private readonly createBakerUseCase: CreateBakerUseCase,
    private readonly findAllBakersUseCase: FindAllBakersUseCase,
    private readonly findOneBakerUseCase: FindOneBakerUseCase,
    private readonly updateBakerUseCase: UpdateBakerUseCase,
    private readonly removeBakerUseCase: RemoveBakerUseCase,
  ) { }

  async create(createBakerDto: CreateBakerDto, user: User): Promise<Baker> {
    return await this.createBakerUseCase.execute(createBakerDto, user);
  }

  async findAll(filters: BakersFilterDto): Promise<PaginationResponse<Baker> | Baker[]> {
    return await this.findAllBakersUseCase.execute(filters);
  }

  async findOne(term: string): Promise<Baker> {
    return await this.findOneBakerUseCase.execute(term);
  }

  async update(id: string, updateBakerDto: UpdateBakerDto, user: User,): Promise<Baker> {
    return await this.updateBakerUseCase.execute(id, updateBakerDto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeBakerUseCase.execute(id, user);
  }

  async assignOrder(
    bakerId: string,
    assignOrderDto: AssignOrderDto,
    user: User,
  ): Promise<OrderAssignment> {
    const baker = await this.findOne(bakerId);

    const order = await this.orderService.getOrderByTerm(
      assignOrderDto.orderId,
    );

    const existingAssignment = await this.orderAssignmentRepository.findOne({
      where: {
        order: { id: assignOrderDto.orderId },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Order ${assignOrderDto.orderId} is already assigned`,
      );
    }

    const assignment = this.orderAssignmentRepository.create({
      baker,
      order,
      assignedDate: assignOrderDto.assignedDate || new Date(),
      notes: assignOrderDto.notes,
      createdBy: user,
      updatedBy: user,
    });

    return await this.orderAssignmentRepository.save(assignment);
  }

  async getAssignments(bakerId: string): Promise<OrderAssignment[]> {
    const baker = await this.findOne(bakerId);

    return await this.orderAssignmentRepository.find({
      where: {
        baker: { id: baker.id },
        order: { status: OrderStatus.CREATED || OrderStatus.IN_PROCESS },
      },
      relations: {
        order: {
          customer: true,
          branch: true,
          details: true,
        },
        createdBy: true,
        updatedBy: true,
      },
      order: { assignedDate: 'DESC' },
    });
  }
}
