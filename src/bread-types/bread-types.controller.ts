import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BreadTypesService } from './bread-types.service';
import { CreateBreadTypeDto } from './dto/create-bread-type.dto';
import { UpdateBreadTypeDto } from './dto/update-bread-type.dto';

@Controller('bread-types')
export class BreadTypesController {
  constructor(private readonly breadTypesService: BreadTypesService) {}

  @Post()
  create(@Body() createBreadTypeDto: CreateBreadTypeDto) {
    return this.breadTypesService.create(createBreadTypeDto);
  }

  @Get()
  findAll() {
    return this.breadTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breadTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBreadTypeDto: UpdateBreadTypeDto) {
    return this.breadTypesService.update(+id, updateBreadTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.breadTypesService.remove(+id);
  }
}
