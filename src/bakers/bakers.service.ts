import { Injectable } from '@nestjs/common';
import { AssignOrderDto } from '../bakers/dto/assign-order.dto';
import { BakersFilterDto } from '../bakers/dto/bakers-filter.dto';
import { CreateBakerDto } from '../bakers/dto/create-baker.dto';
import { UpdateBakerDto } from '../bakers/dto/update-baker.dto';
import { Baker } from '../bakers/entities/baker.entity';
import { OrderAssignment } from '../bakers/entities/order-assignment.entity';
import { CreateBakerUseCase } from '../bakers/usecases/baker/create-baker.usecase';
import { FindAllBakersUseCase } from '../bakers/usecases/baker/find-all-bakers.usecase';
import { FindOneBakerUseCase } from '../bakers/usecases/baker/find-one-baker.usecase';
import { RemoveBakerUseCase } from '../bakers/usecases/baker/remove-baker.usecase';
import { UpdateBakerUseCase } from '../bakers/usecases/baker/update-baker.usecase';
import { AssignOrderUseCase } from '../bakers/usecases/order-assignment/assign-order.usecase';
import { GetAssignmentsUseCase } from '../bakers/usecases/order-assignment/get-assignments.usecase';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BakersService {
  constructor(
    private readonly createBakerUseCase: CreateBakerUseCase,
    private readonly findAllBakersUseCase: FindAllBakersUseCase,
    private readonly findOneBakerUseCase: FindOneBakerUseCase,
    private readonly updateBakerUseCase: UpdateBakerUseCase,
    private readonly removeBakerUseCase: RemoveBakerUseCase,
    private readonly assignOrderUseCase: AssignOrderUseCase,
    private readonly getAssignmentsUseCase: GetAssignmentsUseCase,
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

  async assignOrder(bakerId: string, assignOrderDto: AssignOrderDto, user: User,): Promise<OrderAssignment> {
    return await this.assignOrderUseCase.execute(bakerId, assignOrderDto, user);
  }

  async getAssignments(bakerId: string): Promise<OrderAssignment[]> {
    return await this.getAssignmentsUseCase.execute(bakerId);
  }

  // TODO: Remove assignment
}
