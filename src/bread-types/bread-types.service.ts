import { Injectable } from '@nestjs/common';
import { CreateBreadTypeDto } from './dto/create-bread-type.dto';
import { UpdateBreadTypeDto } from './dto/update-bread-type.dto';

@Injectable()
export class BreadTypesService {
  create(createBreadTypeDto: CreateBreadTypeDto) {
    return 'This action adds a new breadType';
  }

  findAll() {
    return `This action returns all breadTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} breadType`;
  }

  update(id: number, updateBreadTypeDto: UpdateBreadTypeDto) {
    return `This action updates a #${id} breadType`;
  }

  remove(id: number) {
    return `This action removes a #${id} breadType`;
  }
}
