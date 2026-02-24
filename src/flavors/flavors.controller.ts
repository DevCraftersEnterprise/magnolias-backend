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
import { CreateFlavorDto } from './dto/create-flavor.dto';
import { UpdateFlavorDto } from './dto/update-flavor.dto';
import { Flavor } from './entities/flavor.entity';
import { FlavorsService } from './flavors.service';

@ApiTags('Flavors')
@Controller('flavors')
export class FlavorsController {
  constructor(private readonly flavorsService: FlavorsService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create flavor',
    description: 'Creates a new flavor in the catalog.',
  })
  @ApiCreatedResponse({ description: 'Flavor created.', type: Flavor })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createFlavorDto: CreateFlavorDto,
    @CurrentUser() user: User,
  ): Promise<Flavor> {
    return this.flavorsService.create(createFlavorDto, user);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get flavors with optional filters',
    description: 'Retrieves a list of flavors based on provided filters.',
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
  @ApiOkResponse({ description: 'Flavor types list.', type: [Flavor] })
  @ApiOkResponse({
    description: 'List of flavors retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Flavor' },
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
  findAll(
    @Query() filterDto: PaginationDto,
  ): Promise<PaginationResponse<Flavor> | Flavor[]> {
    return this.flavorsService.findAll(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get flavor by term',
    description: 'Retrieves a specific flavor.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Flavor found.', type: Flavor })
  @ApiNotFoundResponse({ description: 'Flavor not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Flavor> {
    return this.flavorsService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update flavor',
    description: 'Updates an existing flavor.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Flavor updated.', type: Flavor })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Flavor not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFlavorDto: UpdateFlavorDto,
    @CurrentUser() user: User,
  ): Promise<Flavor> {
    return this.flavorsService.update(id, updateFlavorDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete flavor',
    description: 'Soft deletes a flavor.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Flavor deleted.' })
  @ApiNotFoundResponse({ description: 'Flavor not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.flavorsService.remove(id, user);
  }
}
