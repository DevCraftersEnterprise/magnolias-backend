import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { CreateColorDto } from './dto/create-color.dto';
import { Color } from './entities/color.entity';
import { CreateColorUseCase } from './usecases/create-color.usecase';
import { FindAllColorsUseCase } from './usecases/find-all-colors.usecase';

@Injectable()
export class ColorsService {
  constructor(
    private readonly createColorUseCase: CreateColorUseCase,
    private readonly findAllColorsUseCase: FindAllColorsUseCase,
  ) {}

  async create(createColorDto: CreateColorDto): Promise<Color> {
    return this.createColorUseCase.execute(createColorDto);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Color> | Color[]> {
    return this.findAllColorsUseCase.execute(paginationDto);
  }
}
