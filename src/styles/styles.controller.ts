import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { Style } from './entities/style.entity';
import { StylesService } from './styles.service';

@ApiTags('Styles')
@Controller('styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create style',
    description: 'Creates a new style in the catalog.',
  })
  @ApiCreatedResponse({ description: 'Style created.', type: Style })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createStyleDto: CreateStyleDto,
    @CurrentUser() user: User,
  ): Promise<Style> {
    return this.stylesService.create(createStyleDto, user);
  }

  @Get('all')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all styles',
    description: 'Retrieves all active styles.',
  })
  @ApiOkResponse({ description: 'Styles list.', type: [Style] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAll(): Promise<Style[]> {
    return this.stylesService.findAll();
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get styles with optional filters',
    description: 'Retrieves a list of Styles based on provided filters.',
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
    description: 'List of Styles retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Style' },
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
  paginated(
    @Query() filterDto: PaginationDto,
  ): Promise<PaginationResponse<Style>> {
    return this.stylesService.paginated(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get style by term',
    description: 'Retrieves a specific style.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Style found.', type: Style })
  @ApiNotFoundResponse({ description: 'Style not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Style> {
    return this.stylesService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update style',
    description: 'Updates an existing style.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Style updated.', type: Style })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Style not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStyleDto: UpdateStyleDto,
    @CurrentUser() user: User,
  ): Promise<Style> {
    return this.stylesService.update(id, updateStyleDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete style',
    description: 'Soft deletes a style.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Style deleted.' })
  @ApiNotFoundResponse({ description: 'Style not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.stylesService.remove(id, user);
  }
}
