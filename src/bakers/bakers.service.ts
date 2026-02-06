import { Injectable } from '@nestjs/common';
import { CreateBakerDto } from './dto/create-baker.dto';
import { UpdateBakerDto } from './dto/update-baker.dto';

@Injectable()
export class BakersService {
  create(createBakerDto: CreateBakerDto) {
    return 'This action adds a new baker';
  }

  findAll() {
    return `This action returns all bakers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} baker`;
  }

  update(id: number, updateBakerDto: UpdateBakerDto) {
    return `This action updates a #${id} baker`;
  }

  remove(id: number) {
    return `This action removes a #${id} baker`;
  }
}
