import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BranchesService } from '../branches/branches.service';
import { ColorsService } from '../colors/colors.service';
import { OrderType } from '../common/enums/order-type.enum';
import { PaginationResponse } from '../common/responses/pagination.response';
import { CustomersService } from '../customers/customers.service';
import { OrderFlower } from '../flowers/entities/order-flower.entity';
import { FlowersService } from '../flowers/flowers.service';
import { ProductsService } from '../products/products.service';
import { User } from '../users/entities/user.entity';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { SetPickupPersonDto } from './dto/set-pickup-person.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderCancellation } from './entities/order-cancellation.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(OrderCancellation)
    private readonly cancellationRepository: Repository<OrderCancellation>,
    @InjectRepository(OrderFlower)
    private readonly orderFlowerRepository: Repository<OrderFlower>,
    private readonly customerService: CustomersService,
    private readonly branchesService: BranchesService,
    private readonly productsService: ProductsService,
    private readonly flowersService: FlowersService,
    private readonly colorsService: ColorsService,
  ) {}

  private async generateOrderCode(orderType: OrderType): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = orderType;

    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const lastOrder = await this.orderRepository.findOne({
      where: { orderType, createdAt: Between(startOfYear, endOfYear) },
      order: { createdAt: 'DESC' },
      select: {
        orderCode: true,
        createdAt: true,
      },
    });

    let sequence = 1;

    if (lastOrder?.orderCode) {
      const parts = lastOrder.orderCode.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2], 10);
        if (!Number.isNaN(lastSequence)) sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  async createOrder(dto: CreateOrderDto, user: User): Promise<Order> {
    const customer = await this.customerService.findOne(dto.customerId);

    const branch = await this.branchesService.findBranchByTerm(dto.branchId);

    if (!branch) throw new NotFoundException('Branch not found');

    const orderCode = await this.generateOrderCode(dto.orderType);

    let deliveryAddress = dto.deliveryAddress;

    if (
      !deliveryAddress &&
      [OrderType.DOMICILIO, OrderType.FLOR].includes(dto.orderType)
    ) {
      deliveryAddress = customer.address;
    }

    const order = this.orderRepository.create({
      orderType: dto.orderType,
      orderCode,
      deliveryRound: dto.deliveryRound,
      productSize: dto.productSize,
      customSize: dto.customSize,
      deliveryDate: dto.deliveryDate,
      deliveryTime: dto.deliveryTime,
      deliveryAddress,
      deliveryNotes: dto.deliveryNotes,
      advancePayment: dto.advancePayment || 0,
      customer,
      branch,
      createdBy: user,
      updatedBy: user,
      status: OrderStatus.CREATED,
    });

    const savedOrder = await this.orderRepository.save(order);

    let totalAmount = 0;

    const productsPromises = dto.details.map((product) =>
      this.productsService.findProductByTerm(product.productId),
    );

    const products = await Promise.all(productsPromises);

    const orderDetails: OrderDetail[] = [];

    for (const detailDto of dto.details) {
      const product = products.find((prd) => prd!.id === detailDto.productId);
      if (!product) continue;

      const orderDetail = this.orderDetailRepository.create({
        ...detailDto,
        order: savedOrder,
        product,
        createdBy: user,
        updatedBy: user,
      });

      orderDetails.push(orderDetail);
      totalAmount += orderDetail.price * orderDetail.quantity;
    }

    await this.orderDetailRepository.save(orderDetails);

    if (dto.orderType === OrderType.FLOR && dto.flowers) {
      const orderFlowers: OrderFlower[] = [];
      const flowersPromises = dto.flowers.map((flower) =>
        this.flowersService.findOne(flower.flowerId),
      );

      const flowers = await Promise.all(flowersPromises);

      for (const flowerDto of dto.flowers) {
        const flower = flowers.find((flw) => flw.id === flowerDto.flowerId);

        const orderFlower = this.orderFlowerRepository.create({
          ...flowerDto,
          order: savedOrder,
          flower,
          quantity: flowerDto.quantity,
          notes: flowerDto.notes,
          createdBy: user,
          updatedBy: user,
        });

        orderFlowers.push(orderFlower);
      }

      await this.orderFlowerRepository.save(orderFlowers);
    }

    savedOrder.totalAmount = totalAmount;
    savedOrder.remainingBalance = totalAmount - savedOrder.advancePayment;

    await this.orderRepository.save(savedOrder);

    return this.getOrderByTerm(savedOrder.id);
  }

  async setPickupPerson(
    orderId: string,
    setPickupPersonDto: SetPickupPersonDto,
    user: User,
  ): Promise<Order> {
    const order = await this.getOrderByTerm(orderId);

    order.pickupPersonName = setPickupPersonDto.pickupPersonName;
    order.pickupPersonPhone = setPickupPersonDto.pickupPersonPhone;
    order.updatedBy = user;

    return await this.orderRepository.save(order);
  }

  async getOrders(
    filter: OrdersFilterDto,
    branchId: string,
  ): Promise<PaginationResponse<Order>> {
    const {
      name,
      orderStatus,
      clientPhone,
      orderDate,
      limit = 10,
      offset = 0,
    } = filter;

    const whereConditions: FindOptionsWhere<Order> = {
      branch: { id: branchId },
      customer: {
        fullName: name ? ILike(`%${name}%`) : undefined,
        phone: clientPhone ? clientPhone : undefined,
      },
      status: orderStatus ? orderStatus : undefined,
      deliveryDate: orderDate ? orderDate : undefined,
    };

    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereConditions,
      relations: {
        customer: true,
        createdBy: true,
        updatedBy: true,
      },
      select: {
        id: true,
        orderCode: true,
        deliveryDate: true,
        deliveryAddress: true,
        deliveryNotes: true,
        pickupPersonName: true,
        pickupPersonPhone: true,
        status: true,
        totalAmount: true,
        advancePayment: true,
        remainingBalance: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          id: true,
          fullName: true,
          phone: true,
        },
        createdBy: {
          name: true,
          lastname: true,
        },
        updatedBy: {
          name: true,
          lastname: true,
        },
      },
      skip: offset,
      take: limit,
      order: { deliveryDate: 'DESC' },
    });

    return {
      items: orders,
      total,
      pagination: {
        limit,
        offset,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderByTerm(term: string): Promise<Order> {
    if (!isUUID(term)) throw new BadRequestException('Invalid UUID format');

    const order = await this.orderRepository.findOne({
      where: { id: term },
      relations: {
        customer: true,
        branch: true,
        details: {
          product: true,
        },
        orderFlowers: {
          flower: true,
        },
        createdBy: true,
        updatedBy: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async updateOrder(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id, deliveryDate, deliveryTime, deliveryAddress, deliveryNotes } =
      dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.CREATED) {
      throw new BadRequestException(
        'Only orders with status CREATED can be updated',
      );
    }

    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (deliveryTime !== undefined) order.deliveryTime = deliveryTime;
    if (deliveryAddress !== undefined) order.deliveryAddress = deliveryAddress;
    if (deliveryNotes !== undefined) order.deliveryNotes = deliveryNotes;

    order.updatedBy = user;

    await this.orderRepository.save(order);

    return this.getOrderByTerm(id);
  }

  async markOrderAsInProcess(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.IN_PROCESS;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  async markOrderAsDone(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.DONE;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }

  async markOrderAsCancel(dto: CancelOrderDto, user: User): Promise<Order> {
    const { id, reason } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    const alreadyCanceled = await this.cancellationRepository.findOne({
      where: { order },
    });

    if (alreadyCanceled) {
      throw new BadRequestException('This order has already been canceled');
    }

    const cancellation = this.cancellationRepository.create({
      order,
      description: reason,
      canceledBy: user,
    });

    await this.cancellationRepository.save(cancellation);

    order.status = OrderStatus.CANCELED;
    order.updatedBy = user;

    await this.orderRepository.update(id, order);

    return this.getOrderByTerm(id);
  }
}
