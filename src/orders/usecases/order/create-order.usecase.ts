import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AddressesService } from '../../../addresses/addresses.service';
import { BranchesService } from '../../../branches/branches.service';
import { Branch } from '../../../branches/entities/branch.entity';
import { OrderType } from '../../../common/enums/order-type.enum';
import { uploadPictureToCloudinary } from '../../../common/utils/upload-to-cloudinary';
import { CustomersService } from '../../../customers/customers.service';
import { Customer } from '../../../customers/entities/customer.entity';
import { AddFlowerToOrderDto } from '../../../flowers/dto/add-flower-to-order.dto';
import { FlowersService } from '../../../flowers/flowers.service';
import { ProductsService } from '../../../products/products.service';
import { User } from '../../../users/entities/user.entity';
import {
  CreateOrderDeliveryAddressDto,
  NewAddressDataDto,
} from '../../dto/create-order-delivery-address.dto';
import { CreateOrderDetailDto } from '../../dto/create-order-detail.dto';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrderDeliveryAddress } from '../../entities/order-delivery-address.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { OrderFlower } from '../../entities/order-flower.entity';
import { Order } from '../../entities/order.entity';
import { parseCurrency } from '../../utils/parse-currency.util';
import { OrderPayment } from '../../entities/order-payment.entity';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDeliveryAddress)
    private readonly orderDeliveryAddressRepository: Repository<OrderDeliveryAddress>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(OrderFlower)
    private readonly orderFlowerRepository: Repository<OrderFlower>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    private readonly customerService: CustomersService,
    private readonly branchesService: BranchesService,
    private readonly addressesService: AddressesService,
    private readonly productsService: ProductsService,
    private readonly flowersService: FlowersService,
  ) { }

  async execute(
    createOrderDto: CreateOrderDto,
    user: User,
    referenceImages?: Express.Multer.File[],
  ) {
    const {
      customerId,
      branchId,
      orderType,
      details,
      deliveryAddress,
      flowers,
      isCustomerPickup,
      ...orderDto
    } = createOrderDto;

    this.logger.log(`Processing order by user ${user.id}`);

    const customer = await this.customerService.findOne(customerId);
    const branch = await this.branchesService.findBranchByTerm(branchId);
    const orderCode = await this.generateOrderCode(orderType, branch);

    const order = this.orderRepository.create({
      ...orderDto,
      orderType,
      orderCode,
      isCustomerPickup,
      customer,
      branch,
      createdBy: user,
      updatedBy: user,
    });

    const savedOrder = await this.orderRepository.save(order);

    if (
      !isCustomerPickup &&
      deliveryAddress &&
      (orderType === OrderType.DOMICILIO ||
        orderType === OrderType.FLOR ||
        orderType === OrderType.EVENTO)
    ) {
      this.logger.log(`Handling delivery address for ${orderType} order`);
      await this.handleDeliveryAddress(deliveryAddress, order, user, customer);
    }

    if (flowers) {
      this.logger.log('Handling flower details for order');
      await this.handleFlowerForOrder(flowers, order, user);
    }

    await this.calculateOrderTotal(details, savedOrder, user, referenceImages);

    return savedOrder;
  }

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
        id: true,
        orderCode: true,
        createdAt: true,
      },
    });

    let sequence = 1;

    if (lastOrder?.orderCode) {
      const parts = lastOrder.orderCode.split('-');
      if (parts.length === 4) {
        const lastSequence = parseInt(parts[3], 10);
        if (!Number.isNaN(lastSequence)) sequence = lastSequence + 1;
      }
    }

    return `${prefix.slice(0, 3)}-${branch.name.toUpperCase().replace(' ', '-')}-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  private async handleDeliveryAddress(
    deliveryAddress: CreateOrderDeliveryAddressDto,
    order: Order,
    user: User,
    customer: Customer,
  ): Promise<void> {
    if (!deliveryAddress) {
      this.logger.warn('No delivery address provided for DOM/FLOR order');
      return;
    }

    let deliveryAddressDto: NewAddressDataDto;

    if (deliveryAddress.useCustomerAddress) {
      this.logger.log('Using customer address for delivery');

      if (!customer.address) {
        this.logger.warn(`Customer does not have an address`);
        return;
      }

      deliveryAddressDto = this.buildDeliveryAddressDto(customer.address);

      const customerDeliveryAddress =
        this.orderDeliveryAddressRepository.create({
          ...deliveryAddressDto,
          deliveryNotes: deliveryAddress.deliveryNotes,
          order,
          receiverName: deliveryAddress.receiverName,
          receiverPhone: deliveryAddress.receiverPhone,
          reference: deliveryAddress.reference,
        });

      await this.orderDeliveryAddressRepository.save(customerDeliveryAddress);
    } else if (deliveryAddress.useCommonAddress) {
      this.logger.log('Using common address for delivery');

      const commonAddress = await this.addressesService.findOne(
        deliveryAddress.commonAddressId!,
      );

      if (!commonAddress) {
        this.logger.warn(
          `Common address with ID ${deliveryAddress.commonAddressId} not found`,
        );
        return;
      }

      deliveryAddressDto = this.buildDeliveryAddressDto(commonAddress);

      await this.addressesService.incrementUsageCount(commonAddress.id);

      const commonDeliveryAddress = this.orderDeliveryAddressRepository.create({
        ...deliveryAddressDto,
        commonAddress,
        deliveryNotes: deliveryAddress.deliveryNotes,
        order,
        receiverName: deliveryAddress.receiverName,
        receiverPhone: deliveryAddress.receiverPhone,
        reference: deliveryAddress.reference,
      });

      await this.orderDeliveryAddressRepository.save(commonDeliveryAddress);
    } else {
      if (deliveryAddress.newAddress) {
        this.logger.log('Creating address for delivery');

        deliveryAddressDto = this.buildDeliveryAddressDto(
          deliveryAddress.newAddress,
        );

        if (deliveryAddress.saveAsCommonAddress) {
          if (!deliveryAddress.commonAddressName) {
            this.logger.warn(
              'Common address name is required to save new address as common',
            );
            return;
          }

          const newCommonAddress = await this.addressesService.create(
            { name: deliveryAddress.commonAddressName, ...deliveryAddressDto },
            user,
          );

          await this.addressesService.incrementUsageCount(newCommonAddress.id);

          const newCommonDeliveryAddress =
            this.orderDeliveryAddressRepository.create({
              ...deliveryAddressDto,
              commonAddress: newCommonAddress,
              deliveryNotes: deliveryAddress.deliveryNotes,
              order,
              receiverName: deliveryAddress.receiverName,
              receiverPhone: deliveryAddress.receiverPhone,
              reference: deliveryAddress.reference,
            });

          await this.orderDeliveryAddressRepository.save(
            newCommonDeliveryAddress,
          );
        } else {
          const orderDeliveryAddress =
            this.orderDeliveryAddressRepository.create({
              ...deliveryAddressDto,
              deliveryNotes: deliveryAddress.deliveryNotes,
              order,
              receiverName: deliveryAddress.receiverName,
              receiverPhone: deliveryAddress.receiverPhone,
              reference: deliveryAddress.reference,
            });

          await this.orderDeliveryAddressRepository.save(orderDeliveryAddress);
        }
      }
    }
  }

  private async handleFlowerForOrder(
    addFlowersToOrderDto: AddFlowerToOrderDto[],
    order: Order,
    user: User,
  ): Promise<void> {
    const orderFlowers: OrderFlower[] = [];

    const flowersPromises = addFlowersToOrderDto.map((flower) =>
      this.flowersService.findOne(flower.flowerId),
    );

    const flowers = await Promise.all(flowersPromises);

    for (const flowerDto of addFlowersToOrderDto) {
      const flower = flowers.find((f) => f.id === flowerDto.flowerId);

      const orderFlower = this.orderFlowerRepository.create({
        ...flowerDto,
        color: { id: flowerDto.colorId },
        order,
        flower,
        createdBy: user,
        updatedBy: user,
      });

      orderFlowers.push(orderFlower);
    }

    await this.orderFlowerRepository.save(orderFlowers);
  }

  private async calculateOrderTotal(
    details: CreateOrderDetailDto[],
    order: Order,
    user: User,
    referenceImages?: Express.Multer.File[],
  ): Promise<void> {
    let totalAmount = 0;

    const productsPromises = details.map((product) =>
      this.productsService.findProductByTerm(product.productId),
    );

    const products = await Promise.all(productsPromises);

    const orderDatails: OrderDetail[] = [];

    const folder =
      process.env.NODE_ENV === 'production'
        ? `magnolias/orders/reference-images`
        : `dev/magnolias/orders/reference-images`;

    for (let i = 0; i < details.length; i++) {
      const detailDto = details[i];
      const product = products.find((p) => p.id === detailDto.productId);
      if (!product) continue;

      let referenceImageUrl: string | undefined;

      if (referenceImages && referenceImages[i]) {
        const file = referenceImages[i];
        const fileName = `${order.orderCode}-detail-${i + 1}-${Date.now()}`;
        referenceImageUrl = await uploadPictureToCloudinary(
          file.buffer,
          folder,
          fileName,
        );
      }

      const orderDetail = this.orderDetailRepository.create({
        ...detailDto,
        breadType: { id: detailDto.breadTypeId },
        filling: { id: detailDto.fillingId },
        flavor: { id: detailDto.flavorId },
        frosting: { id: detailDto.frostingId },
        style: { id: detailDto.styleId },
        color: { id: detailDto.colorId },
        order,
        product,
        referenceImageUrl,
        createdBy: user,
        updatedBy: user,
      });

      orderDatails.push(orderDetail);
      totalAmount += orderDetail.price * detailDto.quantity;
    }

    await this.orderDetailRepository.save(orderDatails);

    order.dessertsTotal = totalAmount;

    if (order.orderType !== OrderType.VITRINA && order.setupServiceCost) {
      totalAmount += parseCurrency(order.setupServiceCost);
    }

    const remainingBalance = totalAmount - parseCurrency(order.advancePayment);

    order.paidAmount = parseCurrency(order.advancePayment);

    Object.assign(order, { totalAmount, remainingBalance, updatedBy: user });

    await this.orderRepository.save(order);

    const orderPayment = this.orderPaymentRepository.create({
      order,
      paidAmount: order.paidAmount,
    });

    await this.orderPaymentRepository.save(orderPayment);
  }

  private buildDeliveryAddressDto(source: any): NewAddressDataDto {
    return {
      street: source.street,
      betweenStreets: source.betweenStreets,
      city: source.city,
      interphoneCode: source.interphoneCode,
      neighborhood: source.neighborhood,
      number: source.number,
      postalCode: source.postalCode,
    };
  }
}
