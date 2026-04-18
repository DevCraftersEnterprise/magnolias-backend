import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateFrostingDto } from './dto/create-frosting.dto';
import { FrostingsFilterDto } from './dto/frostings-filter.dto';
import { UpdateFrostingDto } from './dto/update-frosting.dto';
import { Frosting } from './entities/frosting.entity';
import { CreateFrostingUseCase } from './usecases/create-frosting.usecase';
import { FindAllFrostingsUseCase } from './usecases/find-all-frostings.usecase';
import { FindOneFrostingUseCase } from './usecases/find-one-frosting.usecase';
import { RemoveFrostingUseCase } from './usecases/remove-frosting.usecase';
import { UpdateFrostingUseCase } from './usecases/update-frosting.usecase';

@Injectable()
export class FrostingsService {
  constructor(
    private readonly createFrostingUseCase: CreateFrostingUseCase,
    private readonly findAllFrostingsUseCase: FindAllFrostingsUseCase,
    private readonly findOneFrostingUseCase: FindOneFrostingUseCase,
    private readonly updateFrostingUseCase: UpdateFrostingUseCase,
    private readonly removeFrostingUseCase: RemoveFrostingUseCase,
  ) {}

  async create(dto: CreateFrostingDto, user: User): Promise<Frosting> {
    return await this.createFrostingUseCase.execute(dto, user);
  }

  async findAll(
    frostingsFilterDto: FrostingsFilterDto,
  ): Promise<PaginationResponse<Frosting> | Frosting[]> {
    return await this.findAllFrostingsUseCase.execute(frostingsFilterDto);
  }

  async findOne(term: string): Promise<Frosting> {
    return await this.findOneFrostingUseCase.execute(term);
  }

  async update(
    id: string,
    dto: UpdateFrostingDto,
    user: User,
  ): Promise<Frosting> {
    return await this.updateFrostingUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeFrostingUseCase.execute(id, user);
  }
}
