import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entities/color.entity';
import { CreateColorDto } from './dto/create-color.dto';

@Injectable()
export class ColorsService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  create(createColorDto: CreateColorDto) {
    const color = this.colorRepository.create(createColorDto);
    return this.colorRepository.save(color);
  }

  findAll() {
    return this.colorRepository.find();
  }
}