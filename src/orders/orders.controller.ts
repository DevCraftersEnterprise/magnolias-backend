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
import { AssignOrderDetailDto } from './dto/assign-order-detail.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { SetPickupPersonDto } from './dto/set-pickup-person.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';
import { OrderDetailAssignment } from './entities/order-detail-assignment.entity';
import { OrderDetail } from './entities/order-detail.entity';
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
  @UseInterceptors(FilesInterceptor('referenceImages', 50))
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
  @UseInterceptors(FilesInterceptor('referenceImages', 50))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update order details',
    description:
      'Updates the details of an existing order with status CREATED. New reference images can be uploaded for existing or new order details.',
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
    @UploadedFiles() referenceImages?: Express.Multer.File[],
  ): Promise<Order> {
    if (referenceImages?.length) {
      FileValidator.validateImages(referenceImages);
    }
    return this.ordersService.updateOrder(
      updateOrderDto,
      user,
      referenceImages,
    );
  }

  @Patch('in-process')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mark order as in process (manual override)',
    description:
      'Manually overrides the order status to IN_PROCESS. Under normal use the status ' +
      'is derived automatically from the production status of its order details ' +
      '(see PATCH /orders/details/:detailId/production-status) - this override is only ' +
      'for edge cases (e.g. an order with no lines, or correcting a stuck state).',
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
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mark order as done (manual override)',
    description:
      'Manually overrides the order status to DONE. Under normal use the status is ' +
      'derived automatically once every order detail reaches DONE production status.',
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

  @Delete('details/reference-image/:id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Hide an order detail reference image',
    description:
      'Soft-deletes a single reference image belonging to an order detail.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the reference image',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Reference image successfully hidden.' })
  @ApiBadRequestResponse({ description: 'Reference image already hidden.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Reference image not found.' })
  hideOrderDetailReferenceImage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.ordersService.hideOrderDetailReferenceImage(id, user);
  }


  // Assign bakers per order detail (product line)
  @Post('details/:detailId/assign')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Assign (or reassign) a baker to an order detail',
    description:
      'Assigns a baker to a specific order detail (product line). If the line already ' +
      'has an assignment, it is updated in place (reassign).',
  })
  @ApiParam({
    name: 'detailId',
    description: 'UUID of the order detail',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Order detail successfully assigned.',
    type: OrderDetailAssignment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data, order detail not found, or order is closed.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  assignOrderDetail(
    @Param('detailId', ParseUUIDPipe) detailId: string,
    @Body() assignOrderDetailDto: AssignOrderDetailDto,
    @CurrentUser() user: User,
  ): Promise<OrderDetailAssignment> {
    return this.ordersService.assignOrderDetail(
      detailId,
      assignOrderDetailDto,
      user,
    );
  }

  @Get('details/assignments/:bakerId')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get order-detail assignments for a baker',
    description:
      'Retrieves all order-detail (product line) assignments for a specific baker.',
  })
  @ApiParam({
    name: 'bakerId',
    description: 'UUID of the baker',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'List of order-detail assignments.',
    type: [OrderDetailAssignment],
  })
  @ApiNotFoundResponse({ description: 'Baker not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  getBakerDetailAssignments(
    @Param('bakerId', ParseUUIDPipe) bakerId: string,
  ): Promise<OrderDetailAssignment[]> {
    return this.ordersService.getBakerDetailAssignments(bakerId);
  }

  @Patch('details/:detailId/production-status')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Advance the production status of an order detail',
    description:
      'Sets the production status (PENDING/IN_PROCESS/DONE) of a single order detail. ' +
      "Only the baker assigned to the line (or any branch baker if it's unassigned) or " +
      "SUPER/ADMIN can do this. The parent order's status is re-derived automatically.",
  })
  @ApiParam({
    name: 'detailId',
    description: 'UUID of the order detail',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Production status successfully updated.',
    type: OrderDetail,
  })
  @ApiBadRequestResponse({
    description: 'Order detail not found or order is closed.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  updateProductionStatus(
    @Param('detailId', ParseUUIDPipe) detailId: string,
    @Body() updateProductionStatusDto: UpdateProductionStatusDto,
    @CurrentUser() user: User,
  ): Promise<OrderDetail> {
    return this.ordersService.updateProductionStatus(
      detailId,
      updateProductionStatusDto,
      user,
    );
  }
}
