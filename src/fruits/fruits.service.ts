import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateFruitDto } from './dto/create-fruit.dto';
import { FruitsFilterDto } from './dto/fruits-filter.dto';
import { UpdateFruitDto } from './dto/update-fruit.dto';
import { Fruit } from './entities/fruit.entity';
import { CreateFruitUseCase } from './usecases/create-fruit.usecase';
import { FindAllFruitsUseCase } from './usecases/find-all-fruits.usecase';
import { FindOneFruitUseCase } from './usecases/find-one-fruit.usecase';
import { RemoveFruitUseCase } from './usecases/remove-fruit.usecase';
import { UpdateFruitUseCase } from './usecases/update-fruit.usecase';

@Injectable()
export class FruitsService {
  constructor(
    private readonly createFruitUseCase: CreateFruitUseCase,
    private readonly findAllFruitsUseCase: FindAllFruitsUseCase,
    private readonly findOneFruitUseCase: FindOneFruitUseCase,
    private readonly updateFruitUseCase: UpdateFruitUseCase,
    private readonly removeFruitUseCase: RemoveFruitUseCase,
  ) {}

  async create(dto: CreateFruitDto, user: User): Promise<Fruit> {
    return await this.createFruitUseCase.execute(dto, user);
  }

  async findAll(
    fruitsFilterDto: FruitsFilterDto,
  ): Promise<PaginationResponse<Fruit> | Fruit[]> {
    return await this.findAllFruitsUseCase.execute(fruitsFilterDto);
  }

  async findOne(term: string): Promise<Fruit> {
    return await this.findOneFruitUseCase.execute(term);
  }

  async update(id: string, dto: UpdateFruitDto, user: User): Promise<Fruit> {
    return await this.updateFruitUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeFruitUseCase.execute(id, user);
  }
}
