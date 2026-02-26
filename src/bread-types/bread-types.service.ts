import {
  Injectable
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateBreadTypeDto } from './dto/create-bread-type.dto';
import { UpdateBreadTypeDto } from './dto/update-bread-type.dto';
import { BreadType } from './entities/bread-type.entity';
import { CreateBreadTypeUseCase } from './usecases/create-bread-type.usecase';
import { FindAllBreadTypesUseCase } from './usecases/find-all-bread-types.usecase';
import { FindOneBreadTypeUseCase } from './usecases/find-one-bread-type.usecase';
import { RemoveBreadTypeUseCase } from './usecases/remove-bread-type.usecase';
import { UpdateBreadTypeUseCase } from './usecases/update-bread-type.usecase';

@Injectable()
export class BreadTypesService {
  constructor(
    private readonly createBreadTypeUseCase: CreateBreadTypeUseCase,
    private readonly findAllBreadTypesUseCase: FindAllBreadTypesUseCase,
    private readonly findOneBreadTypeUseCase: FindOneBreadTypeUseCase,
    private readonly updateBreadTypeUseCase: UpdateBreadTypeUseCase,
    private readonly removeBreadTypeUseCase: RemoveBreadTypeUseCase,
  ) { }

  async create(dto: CreateBreadTypeDto, user: User): Promise<BreadType> {
    return await this.createBreadTypeUseCase.execute(dto, user);
  }

  async findAll(paginationDto: PaginationDto,): Promise<PaginationResponse<BreadType> | BreadType[]> {
    return await this.findAllBreadTypesUseCase.execute(paginationDto);
  }

  async findOne(term: string): Promise<BreadType> {
    return await this.findOneBreadTypeUseCase.execute(term);
  }

  async update(id: string, dto: UpdateBreadTypeDto, user: User,): Promise<BreadType> {
    return await this.updateBreadTypeUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeBreadTypeUseCase.execute(id, user);
  }
}
