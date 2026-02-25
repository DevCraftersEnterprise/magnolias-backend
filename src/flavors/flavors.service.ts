import {
  Injectable
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateFlavorDto } from './dto/create-flavor.dto';
import { UpdateFlavorDto } from './dto/update-flavor.dto';
import { Flavor } from './entities/flavor.entity';
import { CreateFlavorUseCase } from './usecases/create-flavor.usecase';
import { FindAllFlavorsUseCase } from './usecases/find-all-flavors.usecase';
import { FindOneFlavorUseCase } from './usecases/find-one-flavor.usecase';
import { RemoveFlavorUseCase } from './usecases/remove-flavor.usecase';
import { UpdateFlavorUseCase } from './usecases/update-flavor.usecase';

@Injectable()
export class FlavorsService {
  constructor(
    private readonly createFlavorUseCase: CreateFlavorUseCase,
    private readonly findAllFlavorsUseCase: FindAllFlavorsUseCase,
    private readonly findOneFlavorUseCase: FindOneFlavorUseCase,
    private readonly updateFlavorUseCase: UpdateFlavorUseCase,
    private readonly removeFlavorUseCase: RemoveFlavorUseCase
  ) { }

  async create(dto: CreateFlavorDto, user: User): Promise<Flavor> {
    return await this.createFlavorUseCase.execute(dto, user);
  }

  async findAll(paginationDto: PaginationDto,): Promise<PaginationResponse<Flavor> | Flavor[]> {
    return await this.findAllFlavorsUseCase.execute(paginationDto);
  }

  async findOne(term: string): Promise<Flavor> {
    return await this.findOneFlavorUseCase.execute(term);
  }

  async update(id: string, dto: UpdateFlavorDto, user: User): Promise<Flavor> {
    return await this.updateFlavorUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeFlavorUseCase.execute(id, user);
  }
}
