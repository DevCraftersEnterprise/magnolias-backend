import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FillingsService } from './fillings.service';
import { CreateFillingDto } from './dto/create-filling.dto';
import { UpdateFillingDto } from './dto/update-filling.dto';
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
import { UserRoles } from '../users/enums/user-role';
import { Filling } from './entities/filling.entity';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';

@ApiTags('Fillings')
@Controller('fillings')
export class FillingsController {
  constructor(private readonly fillingsService: FillingsService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create filling',
    description: 'Creates a new filling in the catalog.',
  })
  @ApiCreatedResponse({ description: 'Filling created.', type: Filling })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createFillingDto: CreateFillingDto,
    @CurrentUser() user: User,
  ): Promise<Filling> {
    return this.fillingsService.create(createFillingDto, user);
  }

  @Get('all')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all fillings',
    description: 'Retrieves all active fillings.',
  })
  @ApiOkResponse({ description: 'Fillings list.', type: [Filling] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAll(): Promise<Filling[]> {
    return this.fillingsService.findAll();
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get fillings with optional filters',
    description: 'Retrieves a list of fillings based on provided filters.',
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
    description: 'List of fillings retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Filling' },
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
  ): Promise<PaginationResponse<Filling>> {
    return this.fillingsService.paginated(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get filling by term',
    description: 'Retrieves a specific filling.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Filling found.', type: Filling })
  @ApiNotFoundResponse({ description: 'Filling not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Filling> {
    return this.fillingsService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update filling',
    description: 'Updates an existing filling.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Filling updated.', type: Filling })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Filling not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFillingDto: UpdateFillingDto,
    @CurrentUser() user: User,
  ): Promise<Filling> {
    return this.fillingsService.update(id, updateFillingDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete filling',
    description: 'Soft deletes a filling.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Filling deleted.' })
  @ApiNotFoundResponse({ description: 'Filling not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.fillingsService.remove(id, user);
  }
}
