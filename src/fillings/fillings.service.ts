import {
  Injectable
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateFillingDto } from './dto/create-filling.dto';
import { UpdateFillingDto } from './dto/update-filling.dto';
import { Filling } from './entities/filling.entity';
import { CreateFillingUseCase } from './usecases/create-filling.usecase';
import { FindAllFillingsUseCase } from './usecases/find-all-fillings.usecase';
import { FindOneFillingUseCase } from './usecases/find-one-filling.usecase';
import { RemoveFillingUseCase } from './usecases/remove-filling.usecase';
import { UpdateFillingUseCase } from './usecases/update-filling.usecase';

@Injectable()
export class FillingsService {
  constructor(
    private readonly createFillingUseCase: CreateFillingUseCase,
    private readonly findAllFillingsUseCase: FindAllFillingsUseCase,
    private readonly findOneFillingUseCase: FindOneFillingUseCase,
    private readonly updateFillingUseCase: UpdateFillingUseCase,
    private readonly removeFillingUseCase: RemoveFillingUseCase
  ) { }

  async create(dto: CreateFillingDto, user: User): Promise<Filling> {
    return await this.createFillingUseCase.execute(dto, user);
  }

  async findAll(paginationDto: PaginationDto,): Promise<PaginationResponse<Filling> | Filling[]> {
    return await this.findAllFillingsUseCase.execute(paginationDto);
  }

  async findOne(term: string): Promise<Filling> {
    return await this.findOneFillingUseCase.execute(term);
  }

  async update(id: string, dto: UpdateFillingDto, user: User,): Promise<Filling> {
    return await this.updateFillingUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeFillingUseCase.execute(id, user);
  }
}
