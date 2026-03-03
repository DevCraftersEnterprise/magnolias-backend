import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateStyleDto } from './dto/create-style.dto';
import { StylesFilterDto } from './dto/styles-filter.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { Style } from './entities/style.entity';
import { CreateStyleUseCase } from './usecases/create-style.usecase';
import { FindAllStylesUseCase } from './usecases/find-all-styles.usecase';
import { FindOneStyleUseCase } from './usecases/find-one-style.usecase';
import { RemoveStyleUseCase } from './usecases/remove-style.usecase';
import { UpdateStyleUseCase } from './usecases/update-style.usecase';

@Injectable()
export class StylesService {
  constructor(
    private readonly createStyleUseCase: CreateStyleUseCase,
    private readonly findAllStylesUseCase: FindAllStylesUseCase,
    private readonly findOneStyleUseCase: FindOneStyleUseCase,
    private readonly updateStyleUseCase: UpdateStyleUseCase,
    private readonly removeStyleUseCase: RemoveStyleUseCase,
  ) {}

  async create(dto: CreateStyleDto, user: User): Promise<Style> {
    return await this.createStyleUseCase.execute(dto, user);
  }

  async findAll(
    stylesFilterDto: StylesFilterDto,
  ): Promise<PaginationResponse<Style> | Style[]> {
    return await this.findAllStylesUseCase.execute(stylesFilterDto);
  }

  async findOne(term: string): Promise<Style> {
    return await this.findOneStyleUseCase.execute(term);
  }

  async update(id: string, dto: UpdateStyleDto, user: User): Promise<Style> {
    return await this.updateStyleUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeStyleUseCase.execute(id, user);
  }
}
