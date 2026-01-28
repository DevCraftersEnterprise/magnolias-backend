import { Controller, 
  Post, 
  Body, 
  Get 
} from '@nestjs/common';
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  createColor(
    @Body() createColorDto: CreateColorDto) {
      return this.colorsService.create(createColorDto);
    }

  @Get()
  findAll() {
    return this.colorsService.findAll();
  }
}
