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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { FileValidator } from '../common/utils/file-validator';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { AssignOrderDto } from './dto/assign-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { SetPickupPersonDto } from './dto/set-pickup-person.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderAssignment } from './entities/order-assignment.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrderStatsResponse } from './responses/order-stats.response';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @UseInterceptors(FilesInterceptor('referenceImages', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a new order with the provided details. Reference images can be uploaded for each order detail.',
  })
  @ApiOkResponse({
    description: 'Order successfully created.',
    type: Order,
  })
  @ApiBadRequestResponse({ description: 'Invalid order data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
    @UploadedFiles() referenceImages?: Express.Multer.File[],
  ): Promise<Order> {
    if (referenceImages?.length) {
      FileValidator.validateImages(referenceImages);
    }
    return this.ordersService.createOrder(
      createOrderDto,
      user,
      referenceImages,
    );
  }

  @Get('stats')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get order statistics',
    description:
      'Retrieves statistics for orders, including counts for different statuses (e.g., CREATED, IN_PROCESS, DONE). ' +
      'Admins and Super users can optionally filter by branch using the branchId query parameter. ' +
      'Other roles will automatically use their associated branch.',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description:
      'UUID of the branch to filter orders by (only for Admins and Super users)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Order statistics retrieved successfully.',
    type: OrderStatsResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request. For example, if the user does not have an associated branch.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  getOrderStats(
    @CurrentUser() user: User,
    @Query('branchId') branchId?: string,
  ): Promise<OrderStatsResponse> {
    return this.ordersService.getStats(user, branchId);
  }

  @Get('branch/:branchId')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get orders for a specific branch',
    description:
      'Retrieves a list of orders for the specified branch with optional filters.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'UUID of the branch to retrieve orders from',
    type: 'string',
    format: 'uuid',
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
    description: 'Filter orders by client name',
  })
  @ApiQuery({
    name: 'orderStatus',
    required: false,
    type: String,
    description: 'Filter orders by status',
  })
  @ApiQuery({
    name: 'clientPhone',
    required: false,
    type: String,
    description: 'Filter orders by client phone',
  })
  @ApiQuery({
    name: 'orderDate',
    required: false,
    type: Date,
    description: 'Filter orders by delivery date',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter orders with delivery date from this date (inclusive)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter orders with delivery date up to this date (inclusive)',
  })
  @ApiOkResponse({
    description: 'List of orders retrieved successfully.',
    type: [Order],
  })
  @ApiOkResponse({
    description: 'List of orders retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Order' },
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
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  getOrders(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() filterDto: OrdersFilterDto,
  ): Promise<PaginationResponse<Order> | Order[]> {
    return this.ordersService.getOrders(filterDto, branchId);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get order by term',
    description: 'Retrieves an order by its unique identifier.',
  })
  @ApiParam({
    name: 'term',
    description: 'UUID of the order to retrieve',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Order retrieved successfully.',
    type: Order,
  })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  getOrderByTerm(@Param('term') term: string): Promise<Order> {
    return this.ordersService.getOrderByTerm(term);
  }

  @Patch()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update order details',
    description:
      'Updates the details of an existing order with status CREATED.',
  })
  @ApiOkResponse({
    description: 'Order successfully updated.',
    type: Order,
  })
  @ApiBadRequestResponse({ description: 'Invalid order data or status.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  updateOrder(
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.updateOrder(updateOrderDto, user);
  }

  @Patch('in-process')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mark order as in process',
    description: 'Updates the order status to IN_PROCESS.',
  })
  @ApiOkResponse({
    description: 'Order status successfully updated to IN_PROCESS.',
    type: Order,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  markOrderAsInProcess(
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.markOrderAsInProcess(updateOrderDto, user);
  }

  @Patch('done')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mark order as done',
    description: 'Updates the order status to DONE.',
  })
  @ApiOkResponse({
    description: 'Order status successfully updated to DONE.',
    type: Order,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  markOrderAsDone(
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.markOrderAsDone(updateOrderDto, user);
  }

  @Patch('delivered')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mark order as delivered',
    description: 'Updates the order status to DELIVERED.',
  })
  @ApiOkResponse({
    description: 'Order status successfully updated to DELIVERED.',
    type: Order,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  markOrderAsDelivered(
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.markOrderAsDelivered(updateOrderDto, user);
  }

  @Patch(':id/pickup-person')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Set pickup person',
    description: 'Sets the person who will pick up the order',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the order',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Pickup person set.', type: Order })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  setPickupPerson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() setPickupPersonDto: SetPickupPersonDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.setPickupPerson(id, setPickupPersonDto, user);
  }

  @Delete('cancel')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cancel an order',
    description: 'Marks an order as canceled with a cancellation reason.',
  })
  @ApiOkResponse({
    description: 'Order successfully canceled.',
    type: Order,
  })
  @ApiBadRequestResponse({ description: 'Order already canceled.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  markOrderAsCancel(
    @Body() cancelOrderDto: CancelOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.markOrderAsCancel(cancelOrderDto, user);
  }

  // Assign Orders
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
    return this.ordersService.assignOrder(id, assignOrderDto, user);
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
    return this.ordersService.getAssignments(id);
  }

  @Patch(':id/reassign-order')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Reassign order to another baker',
    description: 'Reassigns an order to a different baker.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the new baker',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Order successfully reassigned.',
    type: OrderAssignment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or order cannot be reassigned.',
  })
  @ApiNotFoundResponse({ description: 'Baker or Order not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  reassignOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignOrderDto: AssignOrderDto,
    @CurrentUser() user: User,
  ): Promise<OrderAssignment> {
    return this.ordersService.reassignOrder(id, assignOrderDto, user);
  }
}
