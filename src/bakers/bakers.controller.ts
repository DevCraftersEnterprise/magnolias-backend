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
import { BakerArea } from '../common/enums/baker-area.enum';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { BakersService } from './bakers.service';
import { AssignOrderDto } from './dto/assign-order.dto';
import { BakersFilterDto } from './dto/bakers-filter.dto';
import { CreateBakerDto } from './dto/create-baker.dto';
import { UpdateBakerDto } from './dto/update-baker.dto';
import { Baker } from './entities/baker.entity';
import { OrderAssignment } from './entities/order-assignment.entity';

@ApiTags('Bakers')
@Controller('bakers')
export class BakersController {
  constructor(private readonly bakersService: BakersService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new baker',
    description: 'Creates a new baker record in the system.',
  })
  @ApiOkResponse({
    description: 'Baker successfully created.',
    type: Baker,
  })
  @ApiBadRequestResponse({ description: 'Invalid baker data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createBakerDto: CreateBakerDto,
    @CurrentUser() user: User,
  ): Promise<Baker> {
    return this.bakersService.create(createBakerDto, user);
  }

  @Post(':id/assign-order')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Assign order to baker',
    description: 'Assigns an order to a specific baker.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the baker',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Order successfully assigned.',
    type: OrderAssignment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or order already assigned.',
  })
  @ApiNotFoundResponse({ description: 'Baker or Order not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  assignOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignOrderDto: AssignOrderDto,
    @CurrentUser() user: User,
  ): Promise<OrderAssignment> {
    return this.bakersService.assignOrder(id, assignOrderDto, user);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all bakers',
    description: 'Retrieves a paginated list of bakers with optional filters.',
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
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter bakers by name (partial match)',
  })
  @ApiQuery({
    name: 'area',
    required: false,
    enum: BakerArea,
    description: 'Filter bakers by area',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter bakers by active status',
  })
  @ApiOkResponse({
    description: 'List of bakers retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Baker' },
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  paginated(
    @Query() filters: BakersFilterDto,
  ): Promise<PaginationResponse<Baker>> {
    return this.bakersService.paginated(filters);
  }

  @Get('all')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all bakers',
    description: 'Retrieves all active bakers.',
  })
  @ApiOkResponse({ description: 'Bakers list.', type: [Baker] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAll() {
    return this.bakersService.findAll();
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get baker by term',
    description: 'Retrieves a specific baker.',
  })
  @ApiParam({
    name: 'term',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Baker found.',
    type: Baker,
  })
  @ApiNotFoundResponse({ description: 'Baker not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Baker> {
    return this.bakersService.findOne(term);
  }

  @Get(':id/assignments')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get baker assignments',
    description: 'Retrieves all order assignments for a specific baker.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the baker',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'List of assignments.',
    type: [OrderAssignment],
  })
  @ApiNotFoundResponse({ description: 'Baker not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  getAssignments(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderAssignment[]> {
    return this.bakersService.getAssignments(id);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update baker',
    description: 'Updates an existing baker record.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the baker to update',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Baker successfully updated.',
    type: Baker,
  })
  @ApiBadRequestResponse({ description: 'Invalid baker data.' })
  @ApiNotFoundResponse({ description: 'Baker not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBakerDto: UpdateBakerDto,
    @CurrentUser() user: User,
  ): Promise<Baker> {
    return this.bakersService.update(id, updateBakerDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete baker',
    description: 'Soft deletes a baker (marks as inactive).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the baker to delete',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Baker successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Baker not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.bakersService.remove(id, user);
  }
}
