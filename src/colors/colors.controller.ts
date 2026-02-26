import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { UserRoles } from '../users/enums/user-role';
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { Color } from './entities/color.entity';
@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) { }

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
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiOkResponse({
    description: 'List of all colors retrieved successfully.',
    type: [Color],
  })
  @ApiOkResponse({
    description: 'List of colors retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Color' },
        },
        total: { type: 'number', example: 100 },
        pagination: {
          type: 'object',
          properties: {
            limit: { type: 'number', example: 10 },
            offset: { type: 'number', example: 0 },
            totalPages: { type: 'number', example: 10 },
            currentPage: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<PaginationResponse<Color> | Color[]> {
    return this.colorsService.findAll(paginationDto);
  }

  // Activar color
  // Desactivar color
}
