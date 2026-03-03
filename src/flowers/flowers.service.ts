import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { FlowersFilterDto } from './dto/flowers-filter.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';
import { Flower } from './entities/flower.entity';
import { CreateFlowerUseCase } from './usecases/create-flower.usecase';
import { FindAllFlowersUseCase } from './usecases/find-all-flowers.usecase';
import { FindOneFlowerUseCase } from './usecases/find-one-flower.usecase';
import { RemoveFlowerUseCase } from './usecases/remove-flower.usecase';
import { UpdateFlowerUseCase } from './usecases/update-flower.usecase';

@Injectable()
export class FlowersService {
  constructor(
    private readonly createFlowerUseCase: CreateFlowerUseCase,
    private readonly findAllFlowersUseCase: FindAllFlowersUseCase,
    private readonly findOneFlowerUseCase: FindOneFlowerUseCase,
    private readonly updateFlowerUseCase: UpdateFlowerUseCase,
    private readonly removeFlowerUseCase: RemoveFlowerUseCase,
  ) {}

  async create(createFlowerDto: CreateFlowerDto, user: User): Promise<Flower> {
    return await this.createFlowerUseCase.execute(createFlowerDto, user);
  }

  async findAll(
    flowersFilterDto: FlowersFilterDto,
  ): Promise<PaginationResponse<Flower> | Flower[]> {
    return await this.findAllFlowersUseCase.execute(flowersFilterDto);
  }

  async findOne(term: string): Promise<Flower> {
    return await this.findOneFlowerUseCase.execute(term);
  }

  async update(
    id: string,
    updateFlowerDto: UpdateFlowerDto,
    user: User,
  ): Promise<Flower> {
    return await this.updateFlowerUseCase.execute(id, updateFlowerDto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeFlowerUseCase.execute(id, user);
  }
}
