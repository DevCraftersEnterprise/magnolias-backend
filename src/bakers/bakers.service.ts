import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationResponse } from '../common/responses/pagination.response';
import { OrdersService } from '../orders/orders.service';
import { User } from '../users/entities/user.entity';
import { BakersFilterDto } from './dto/bakers-filter.dto';
import { CreateBakerDto } from './dto/create-baker.dto';
import { UpdateBakerDto } from './dto/update-baker.dto';
import { Baker } from './entities/baker.entity';
import { OrderAssignment } from './entities/order-assignment.entity';
import { isUUID } from 'class-validator';
import { AssignOrderDto } from './dto/assign-order.dto';
import { OrderStatus } from 'src/orders/enums/order-status.enum';

@Injectable()
export class BakersService {
  constructor(
    @InjectRepository(Baker)
    private readonly bakerRepository: Repository<Baker>,
    @InjectRepository(OrderAssignment)
    private readonly orderAssignmentRepository: Repository<OrderAssignment>,
    private readonly orderService: OrdersService,
  ) {}

  async create(createBakerDto: CreateBakerDto, user: User): Promise<Baker> {
    const baker = this.bakerRepository.create({
      ...createBakerDto,
      createdBy: user,
      updatedBy: user,
    });

    return await this.bakerRepository.save(baker);
  }

  async findAll(
    filters: BakersFilterDto,
  ): Promise<PaginationResponse<Baker> | Baker[]> {
    const { name, area, isActive, limit, offset } = filters;

    const whereConditions: FindOptionsWhere<Baker> = {
      fullName: name ? ILike(`%${name}%`) : undefined,
      area: area ? area : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    };

    const [bakers, total] = await this.bakerRepository.findAndCount({
      where: whereConditions,
      skip: offset,
      take: limit,
      order: { fullName: 'ASC' },
    });

    if (limit && offset) {
      return {
        items: bakers,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    return bakers;
  }

  async findOne(term: string): Promise<Baker> {
    const whereConditions: FindOptionsWhere<Baker> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.fullName = term.toUpperCase();

    const baker = await this.bakerRepository.findOne({
      where: whereConditions,
      relations: {
        assignments: {
          order: true,
        },
      },
    });

    if (!baker) {
      throw new Error(`Baker with identifier "${term}" not found`);
    }

    return baker;
  }

  async update(
    id: string,
    updateBakerDto: UpdateBakerDto,
    user: User,
  ): Promise<Baker> {
    const baker = await this.findOne(id);

    Object.assign(baker, updateBakerDto);
    baker.updatedBy = user;

    return await this.bakerRepository.save(baker);
  }

  async remove(id: string, user: User): Promise<void> {
    const baker = await this.findOne(id);

    baker.isActive = false;
    baker.updatedBy = user;

    await this.bakerRepository.save(baker);
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
