import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
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
  @ApiOperation({
    summary: 'Create a new color',
    description: 'Creates a new color with the provided details.',
  })
  @ApiCreatedResponse({
    description: 'Color created successfully.',
    type: Color,
  })
  @ApiBadRequestResponse({ description: 'Invalid color data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  createColor(@Body() createColorDto: CreateColorDto): Promise<Color> {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all colors',
    description: 'Retrieves a list of all available colors.',
  })
  @ApiOkResponse({
    description: 'List of colors retrieved successfully.',
    type: [Color],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAll(): Promise<Color[]> {
    return this.colorsService.findAll();
  }

  // Activar color
  // Desactivar color
}
