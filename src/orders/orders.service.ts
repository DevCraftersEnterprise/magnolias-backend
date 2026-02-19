import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BranchesService } from '../branches/branches.service';
import { OrderType } from '../common/enums/order-type.enum';
import { PaginationResponse } from '../common/responses/pagination.response';
import { uploadPictureToCloudinary } from '../common/utils/upload-to-cloudinary';
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
import { OrderDeliveryAddress } from './entities/order-delivery-address.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { AddressesService } from '../addresses/addresses.service';
import { Branch } from '../branches/entities/branch.entity';

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
    @InjectRepository(OrderDeliveryAddress)
    private readonly orderDeliveryAddressRepository: Repository<OrderDeliveryAddress>,
    private readonly customerService: CustomersService,
    private readonly branchesService: BranchesService,
    private readonly productsService: ProductsService,
    private readonly flowersService: FlowersService,
    private readonly addressesService: AddressesService,
  ) {}

  private async generateOrderCode(
    orderType: OrderType,
    branch: Branch,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = orderType;

    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const lastOrder = await this.orderRepository.findOne({
      where: {
        orderType,
        branch: { id: branch.id },
        createdAt: Between(startOfYear, endOfYear),
      },
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

    return `${prefix}-${branch.name.toUpperCase()}-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  async createOrder(
    dto: CreateOrderDto,
    user: User,
    referenceImages?: Express.Multer.File[],
  ): Promise<Order> {
    const customer = await this.customerService.findOne(dto.customerId);

    const branch = await this.branchesService.findBranchByTerm(dto.branchId);

    if (!branch) throw new NotFoundException('Branch not found');

    const orderCode = await this.generateOrderCode(dto.orderType, branch);

    const order = this.orderRepository.create({
      orderType: dto.orderType,
      orderCode,
      deliveryRound: dto.deliveryRound,
      deliveryDate: dto.deliveryDate,
      deliveryTime: dto.deliveryTime,
      advancePayment: dto.advancePayment || 0,
      customer,
      branch,
      createdBy: user,
      updatedBy: user,
      status: OrderStatus.CREATED,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Handle delivery address for DOM and FLOR orders
    if ([OrderType.DOMICILIO, OrderType.FLOR].includes(dto.orderType)) {
      let deliveryAddressData: Partial<OrderDeliveryAddress> = {};

      if (dto.deliveryAddress) {
        if (dto.deliveryAddress.useCustomerAddress) {
          deliveryAddressData = {
            street: customer.address.street,
            betweenStreets: customer.address.betweenStreets,
            city: customer.address.city,
            interphoneCode: customer.address.interphoneCode,
            neighborhood: customer.address.neighborhood,
            number: customer.address.number,
            postalCode: customer.address.postalCode,
          };
        } else if (dto.deliveryAddress.useCommonAddress) {
          const common = await this.addressesService.findOne(
            dto.deliveryAddress.commonAddressId!,
          );

          deliveryAddressData = {
            street: common.street,
            betweenStreets: common.betweenStreets,
            city: common.city,
            interphoneCode: common.interphoneCode,
            neighborhood: common.neighborhood,
            number: common.number,
            postalCode: common.postalCode,
            commonAddress: common,
          };

          await this.addressesService.incrementUsageCount(common.id);
        } else {
          deliveryAddressData = {
            street: dto.deliveryAddress.newAddress!.street,
            betweenStreets: dto.deliveryAddress.newAddress!.betweenStreets,
            city: dto.deliveryAddress.newAddress!.city,
            interphoneCode: dto.deliveryAddress.newAddress!.interphoneCode,
            neighborhood: dto.deliveryAddress.newAddress!.neighborhood,
            number: dto.deliveryAddress.newAddress!.number,
            postalCode: dto.deliveryAddress.newAddress!.postalCode,
          };
        }

        deliveryAddressData.deliveryNotes = dto.deliveryAddress.deliveryNotes;
        deliveryAddressData.reference = dto.deliveryAddress.reference;
        deliveryAddressData.receiverName = dto.deliveryAddress.receiverName;
        deliveryAddressData.receiverPhone = dto.deliveryAddress.receiverPhone;
      }

      if (Object.keys(deliveryAddressData).length > 0) {
        const deliveryAddress = this.orderDeliveryAddressRepository.create({
          ...deliveryAddressData,
          order: savedOrder,
        });
        await this.orderDeliveryAddressRepository.save(deliveryAddress);
      }
    }

    let totalAmount = 0;

    const productsPromises = dto.details.map((product) =>
      this.productsService.findProductByTerm(product.productId),
    );

    const products = await Promise.all(productsPromises);

    const orderDetails: OrderDetail[] = [];

    const folder =
      process.env.NODE_ENV === 'development'
        ? `dev/magnolias/orders/reference-images`
        : `magnolias/orders/reference-images`;

    for (let i = 0; i < dto.details.length; i++) {
      const detailDto = dto.details[i];
      const product = products.find((prd) => prd.id === detailDto.productId);
      if (!product) continue;

      let referenceImageUrl: string | undefined;

      if (referenceImages && referenceImages[i]) {
        const file = referenceImages[i];
        const fileName = `${savedOrder.orderCode}-detail-${i + 1}-${Date.now()}`;
        referenceImageUrl = await uploadPictureToCloudinary(
          file.buffer,
          folder,
          fileName,
        );
      }

      const orderDetail = this.orderDetailRepository.create({
        ...detailDto,
        order: savedOrder,
        product,
        referenceImageUrl,
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

    // Update or create delivery address with receiver info
    if (order.deliveryAddress) {
      order.deliveryAddress.receiverName = setPickupPersonDto.pickupPersonName;
      order.deliveryAddress.receiverPhone =
        setPickupPersonDto.pickupPersonPhone;
      await this.orderDeliveryAddressRepository.save(order.deliveryAddress);
    } else {
      const deliveryAddress = this.orderDeliveryAddressRepository.create({
        receiverName: setPickupPersonDto.pickupPersonName,
        receiverPhone: setPickupPersonDto.pickupPersonPhone,
        order,
      });
      await this.orderDeliveryAddressRepository.save(deliveryAddress);
    }

    order.updatedBy = user;
    await this.orderRepository.save(order);

    return this.getOrderByTerm(orderId);
  }

  async getOrders(
    filter: OrdersFilterDto,
    branchId: string,
  ): Promise<PaginationResponse<Order> | Order[]> {
    const { name, orderStatus, clientPhone, orderDate, limit, offset } = filter;

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
        deliveryAddress: true,
        createdBy: true,
        updatedBy: true,
      },
      select: {
        id: true,
        orderCode: true,
        deliveryDate: true,
        status: true,
        totalAmount: true,
        advancePayment: true,
        remainingBalance: true,
        createdAt: true,
        updatedAt: true,
        deliveryAddress: {
          id: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          receiverName: true,
          receiverPhone: true,
          deliveryNotes: true,
        },
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

    if (limit && offset) {
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

    return orders;
  }

  async getOrderByTerm(term: string): Promise<Order> {
    if (!isUUID(term)) throw new BadRequestException('Invalid UUID format');

    const order = await this.orderRepository.findOne({
      where: { id: term },
      relations: {
        customer: { address: true },
        branch: true,
        deliveryAddress: true,
        details: {
          product: true,
          frosting: true,
          breadType: true,
          style: true,
          filling: true,
          color: true,
          flavor: true,
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
    const { id, deliveryDate, deliveryTime, deliveryAddress } = dto;

    const order = await this.getOrderByTerm(id);

    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.CREATED) {
      throw new BadRequestException(
        'Only orders with status CREATED can be updated',
      );
    }

    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (deliveryTime) order.deliveryTime = deliveryTime;

    if (deliveryAddress && order.deliveryAddress) {
      const oldCommonId = order.deliveryAddress.commonAddress?.id;
      let newCommonId: string | undefined;

      if (deliveryAddress.useCustomerAddress) {
        const customer = await this.customerService.findOne(order.customer.id);
        order.deliveryAddress.street = customer.address.street;
        order.deliveryAddress.betweenStreets = customer.address.betweenStreets;
        order.deliveryAddress.city = customer.address.city;
        order.deliveryAddress.interphoneCode = customer.address.interphoneCode;
        order.deliveryAddress.neighborhood = customer.address.neighborhood;
        order.deliveryAddress.number = customer.address.number;
        order.deliveryAddress.postalCode = customer.address.postalCode;
        order.deliveryAddress.commonAddress = undefined;
        newCommonId = undefined;
      } else if (
        deliveryAddress.useCommonAddress &&
        deliveryAddress.commonAddressId
      ) {
        const common = await this.addressesService.findOne(
          deliveryAddress.commonAddressId,
        );
        order.deliveryAddress.street = common.street;
        order.deliveryAddress.betweenStreets = common.betweenStreets;
        order.deliveryAddress.city = common.city;
        order.deliveryAddress.interphoneCode = common.interphoneCode;
        order.deliveryAddress.neighborhood = common.neighborhood;
        order.deliveryAddress.number = common.number;
        order.deliveryAddress.postalCode = common.postalCode;
        order.deliveryAddress.commonAddress = common;
        newCommonId = common.id;
      } else if (deliveryAddress.newAddress) {
        order.deliveryAddress.street = deliveryAddress.newAddress.street;
        order.deliveryAddress.betweenStreets =
          deliveryAddress.newAddress.betweenStreets;
        order.deliveryAddress.city = deliveryAddress.newAddress.city;
        order.deliveryAddress.interphoneCode =
          deliveryAddress.newAddress.interphoneCode;
        order.deliveryAddress.neighborhood =
          deliveryAddress.newAddress.neighborhood;
        order.deliveryAddress.number = deliveryAddress.newAddress.number;
        order.deliveryAddress.postalCode =
          deliveryAddress.newAddress.postalCode;
        order.deliveryAddress.commonAddress = undefined;
        newCommonId = undefined;
      }

      if (deliveryAddress.deliveryNotes) {
        order.deliveryAddress.deliveryNotes = deliveryAddress.deliveryNotes;
      }
      if (deliveryAddress.reference) {
        order.deliveryAddress.reference = deliveryAddress.reference;
      }
      if (deliveryAddress.receiverName) {
        order.deliveryAddress.receiverName = deliveryAddress.receiverName;
      }
      if (deliveryAddress.receiverPhone) {
        order.deliveryAddress.receiverPhone = deliveryAddress.receiverPhone;
      }

      if (oldCommonId && oldCommonId !== newCommonId) {
        await this.addressesService.decrementUsageCount(oldCommonId);
      }
      if (newCommonId && oldCommonId !== newCommonId) {
        await this.addressesService.incrementUsageCount(newCommonId);
      }

      await this.orderDeliveryAddressRepository.save(order.deliveryAddress);
    }
    // ...existing code...

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

  async markOrderAsDelivered(dto: UpdateOrderDto, user: User): Promise<Order> {
    const { id } = dto;

    const order = await this.orderRepository.preload({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.DELIVERED;
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
