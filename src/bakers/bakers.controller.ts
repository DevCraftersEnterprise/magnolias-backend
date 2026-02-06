import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BakersService } from './bakers.service';
import { CreateBakerDto } from './dto/create-baker.dto';
import { UpdateBakerDto } from './dto/update-baker.dto';

@Controller('bakers')
export class BakersController {
  constructor(private readonly bakersService: BakersService) {}

  @Post()
  create(@Body() createBakerDto: CreateBakerDto) {
    return this.bakersService.create(createBakerDto);
  }

  @Get()
  findAll() {
    return this.bakersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bakersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBakerDto: UpdateBakerDto) {
    return this.bakersService.update(+id, updateBakerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bakersService.remove(+id);
  }
}
