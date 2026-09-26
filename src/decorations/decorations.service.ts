import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateDecorationDto } from './dto/create-decoration.dto';
import { DecorationsFilterDto } from './dto/decorations-filter.dto';
import { UpdateDecorationDto } from './dto/update-decoration.dto';
import { Decoration } from './entities/decoration.entity';
import { CreateDecorationUseCase } from './usecases/create-decoration.usecase';
import { FindAllDecorationsUseCase } from './usecases/find-all-decorations.usecase';
import { FindOneDecorationUseCase } from './usecases/find-one-decoration.usecase';
import { RemoveDecorationUseCase } from './usecases/remove-decoration.usecase';
import { UpdateDecorationUseCase } from './usecases/update-decoration.usecase';

@Injectable()
export class DecorationsService {
  constructor(
    private readonly createDecorationUseCase: CreateDecorationUseCase,
    private readonly findAllDecorationsUseCase: FindAllDecorationsUseCase,
    private readonly findOneDecorationUseCase: FindOneDecorationUseCase,
    private readonly updateDecorationUseCase: UpdateDecorationUseCase,
    private readonly removeDecorationUseCase: RemoveDecorationUseCase,
  ) {}

  async create(dto: CreateDecorationDto, user: User): Promise<Decoration> {
    return await this.createDecorationUseCase.execute(dto, user);
  }

  async findAll(
    decorationsFilterDto: DecorationsFilterDto,
  ): Promise<PaginationResponse<Decoration> | Decoration[]> {
    return await this.findAllDecorationsUseCase.execute(decorationsFilterDto);
  }

  async findOne(term: string): Promise<Decoration> {
    return await this.findOneDecorationUseCase.execute(term);
  }

  async update(
    id: string,
    dto: UpdateDecorationDto,
    user: User,
  ): Promise<Decoration> {
    return await this.updateDecorationUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeDecorationUseCase.execute(id, user);
  }
}
