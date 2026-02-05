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
import { UserRoles } from 'src/users/enums/user-role';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { BreadTypesService } from './bread-types.service';
import { CreateBreadTypeDto } from './dto/create-bread-type.dto';
import { UpdateBreadTypeDto } from './dto/update-bread-type.dto';
import { BreadType } from './entities/bread-type.entity';

@ApiTags('Bread Types')
@Controller('bread-types')
export class BreadTypesController {
  constructor(private readonly breadTypesService: BreadTypesService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create bread type',
    description: 'Creates a new bread type in the catalog.',
  })
  @ApiCreatedResponse({ description: 'Bread type created.', type: BreadType })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createBreadTypeDto: CreateBreadTypeDto,
    @CurrentUser() user: User,
  ): Promise<BreadType> {
    return this.breadTypesService.create(createBreadTypeDto, user);
  }

  @Get('all')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all bread types',
    description: 'Retrieves all active bread types.',
  })
  @ApiOkResponse({ description: 'Bread types list.', type: [BreadType] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAll(): Promise<BreadType[]> {
    return this.breadTypesService.findAll();
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get bread types with optional filters',
    description: 'Retrieves a list of bread types based on provided filters.',
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
    description: 'List of bread types retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/BreadType' },
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
  ): Promise<PaginationResponse<BreadType>> {
    return this.breadTypesService.paginated(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get bread type by term',
    description: 'Retrieves a specific bread type.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Bread type found.', type: BreadType })
  @ApiNotFoundResponse({ description: 'Bread type not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<BreadType> {
    return this.breadTypesService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update bread type',
    description: 'Updates an existing bread type.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Bread type updated.', type: BreadType })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Bread type not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBreadTypeDto: UpdateBreadTypeDto,
    @CurrentUser() user: User,
  ): Promise<BreadType> {
    return this.breadTypesService.update(id, updateBreadTypeDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete bread type',
    description: 'Soft deletes a bread type.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Bread type deleted.' })
  @ApiNotFoundResponse({ description: 'Bread type not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.breadTypesService.remove(id, user);
  }
}
