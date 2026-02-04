import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '../users/enums/user-role';
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { Color } from './entities/color.entity';
@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({
    description: 'Color created successfully.',
    type: Color,
  })
  createColor(@Body() createColorDto: CreateColorDto): Promise<Color> {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'List of colors retrieved successfully.',
    type: [Color],
  })
  findAll(): Promise<Color[]> {
    return this.colorsService.findAll();
  }
}
