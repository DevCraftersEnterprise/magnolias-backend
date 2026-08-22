import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressesService } from '../../../addresses/addresses.service';
import { BranchesService } from '../../../branches/branches.service';
import { uploadPictureToCloudinary } from '../../../common/utils/upload-to-cloudinary';
import { CustomersService } from '../../../customers/customers.service';
import { Customer } from '../../../customers/entities/customer.entity';
import { AddFlowerToOrderDto } from '../../../flowers/dto/add-flower-to-order.dto';
import { FlowersService } from '../../../flowers/flowers.service';
import { ProductsService } from '../../../products/products.service';
import { User } from '../../../users/entities/user.entity';
import { UserRoles } from '../../../users/enums/user-role';
import { verifyEmployeeActionToken } from '../../../branch-employees/utils/verify-employee-action-token.util';
import {
  CreateOrderDeliveryAddressDto,
  NewAddressDataDto,
} from '../../dto/create-order-delivery-address.dto';
import { CreateOrderDetailDto } from '../../dto/create-order-detail.dto';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrderDeliveryAddress } from '../../entities/order-delivery-address.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { OrderEmployeeAction } from '../../entities/order-employee-action.entity';
import { OrderFlower } from '../../entities/order-flower.entity';
import { Order } from '../../entities/order.entity';
import { OrderEmployeeActionType } from '../../enums/order-employee-action-type.enum';
import { buildOrderDetailData } from '../../utils/build-order-detail-data.util';
import { generateOrderCode } from '../../utils/generate-order-code.util';
import { parseCurrency } from '../../utils/parse-currency.util';
import { verifyDiscountAuthToken } from '../../utils/verify-discount-auth-token.util';
import { OrderPayment } from '../../entities/order-payment.entity';
import { OrderDetailReferenceImage } from '../../entities/order-detail-reference-image.entity';

const MAX_REFERENCE_IMAGES_PER_DETAIL = 10;

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
    @InjectRepository(OrderDetailReferenceImage)
    private readonly orderDetailReferenceImageRepository: Repository<OrderDetailReferenceImage>,
    @InjectRepository(OrderFlower)
    private readonly orderFlowerRepository: Repository<OrderFlower>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    @InjectRepository(OrderEmployeeAction)
    private readonly orderEmployeeActionRepository: Repository<OrderEmployeeAction>,
    private readonly customerService: CustomersService,
    private readonly branchesService: BranchesService,
    private readonly addressesService: AddressesService,
    private readonly productsService: ProductsService,
    private readonly flowersService: FlowersService,
    private readonly jwtService: JwtService,
  ) { }

  async execute(
    createOrderDto: CreateOrderDto,
    user: User,
    referenceImages?: Express.Multer.File[],
  ) {
    const {
      customerId,
      branchId,
      isEvento,
      isEnTienda,
      includesFlowers,
      details,
      deliveryAddress,
      flowers,
      isCustomerPickup,
      referenceImageDetailIndex,
      discountAuthToken,
      employeeActionToken,
      ...orderDto
    } = createOrderDto;

    let discountAuthorizedById: string | undefined;

    if (details.some((detail) => (detail.discountPercent ?? 0) > 0)) {
      discountAuthorizedById = verifyDiscountAuthToken(
        this.jwtService,
        discountAuthToken,
      );
    }

    let employeeId: string | undefined;

    if (user.role === UserRoles.EMPLOYEE) {
      employeeId = verifyEmployeeActionToken(
        this.jwtService,
        employeeActionToken,
      );
    }

    this.logger.log(`Processing order by user ${user.id}`);

    const customer = await this.customerService.findOne(customerId);
    const branch = await this.branchesService.findBranchByTerm(branchId);
    const orderCode = await generateOrderCode(
      this.orderRepository,
      { isEvento: !!isEvento, isEnTienda: !!isEnTienda },
      branch,
    );

    const order = this.orderRepository.create({
      ...orderDto,
      isEvento: !!isEvento,
      isEnTienda: !!isEnTienda,
      includesFlowers: !!includesFlowers,
      orderCode,
      isCustomerPickup,
      customer,
      branch,
      createdBy: user,
      updatedBy: user,
    });

    const savedOrder = await this.orderRepository.save(order);

    if (employeeId) {
      const orderEmployeeAction = this.orderEmployeeActionRepository.create({
        order: savedOrder,
        employee: { id: employeeId },
        action: OrderEmployeeActionType.CREATED,
      });

      await this.orderEmployeeActionRepository.save(orderEmployeeAction);
    }

    if (!isCustomerPickup && deliveryAddress && !isEnTienda) {
      this.logger.log('Handling delivery address for order');
      await this.handleDeliveryAddress(deliveryAddress, order, user, customer);
    }

    if (flowers) {
      this.logger.log('Handling flower details for order');
      await this.handleFlowerForOrder(flowers, order, user);
    }

    await this.calculateOrderTotal(
      details,
      savedOrder,
      user,
      referenceImages,
      referenceImageDetailIndex,
      discountAuthorizedById,
    );

    return savedOrder;
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
    referenceImageDetailIndex?: number[],
    discountAuthorizedById?: string,
  ): Promise<void> {
    let totalAmount = 0;

    const productsPromises = details.map((product) =>
      this.productsService.findProductByTerm(product.productId),
    );

    const products = await Promise.all(productsPromises);

    const orderDatails: OrderDetail[] = [];
    const pendingReferenceFiles: {
      detail: OrderDetail;
      files: Express.Multer.File[];
    }[] = [];

    let folder = '';

    switch (process.env.NODE_ENV) {
      case 'production': folder = 'magnolias/orders/reference-images'; break;
      case 'staging': folder = 'staging/magnolias/orders/reference-images'; break;
      default: folder = 'development/magnolias/orders/reference-images'; break;
    }

    for (let i = 0; i < details.length; i++) {
      const detailDto = details[i];
      const product = products[i];

      const hasDiscount = (detailDto.discountPercent ?? 0) > 0;

      const orderDetail = this.orderDetailRepository.create(
        buildOrderDetailData(
          detailDto,
          order,
          product,
          user,
          discountAuthorizedById,
        ),
      );

      orderDatails.push(orderDetail);

      const lineTotal = orderDetail.price * detailDto.quantity;
      const discountedLineTotal = hasDiscount
        ? lineTotal * (1 - detailDto.discountPercent! / 100)
        : lineTotal;

      totalAmount += discountedLineTotal;

      const filesForDetail = (referenceImages ?? []).filter(
        (_, fileIndex) => referenceImageDetailIndex?.[fileIndex] === i,
      );

      if (filesForDetail.length > MAX_REFERENCE_IMAGES_PER_DETAIL) {
        throw new BadRequestException(
          `A product can have at most ${MAX_REFERENCE_IMAGES_PER_DETAIL} reference images`,
        );
      }

      if (filesForDetail.length > 0) {
        pendingReferenceFiles.push({ detail: orderDetail, files: filesForDetail });
      }
    }

    await this.orderDetailRepository.save(orderDatails);

    for (const { detail, files } of pendingReferenceFiles) {
      const images: OrderDetailReferenceImage[] = [];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const fileName = `${order.orderCode}-detail-${detail.id}-${fileIndex + 1}-${Date.now()}`;
        const imageUrl = await uploadPictureToCloudinary(
          files[fileIndex].buffer,
          folder,
          fileName,
        );

        images.push(
          this.orderDetailReferenceImageRepository.create({
            imageUrl,
            orderDetail: detail,
            createdBy: user,
            updatedBy: user,
          }),
        );
      }

      await this.orderDetailReferenceImageRepository.save(images);
    }

    order.dessertsTotal = totalAmount;

    if (!order.isEnTienda && order.setupServiceCost) {
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
