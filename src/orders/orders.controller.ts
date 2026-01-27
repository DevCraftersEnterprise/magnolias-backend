import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  createOrder(
    createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto, user);
  }

  @Get('branch/:branchId')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  getOrders(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() filterDto: FilterDto,
  ): Promise<PaginationResponse<Order>> {
    return this.ordersService.getOrders(filterDto, branchId);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  getOrderByTerm(@Param('term') term: string): Promise<Order> {
    return this.ordersService.getOrderByTerm(term);
  }

  @Patch()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  updateOrder(
    updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.updateOrder(updateOrderDto, user);
  }

  @Patch('done')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  markOrderAsDone(
    updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.markOrderAsDone(updateOrderDto, user);
  }

  @Delete('cancel')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  markOrderAsCancel(
    cancelOrderDto: CancelOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.markOrderAsCancel(cancelOrderDto, user);
  }
}
