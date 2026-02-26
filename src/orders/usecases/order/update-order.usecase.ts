import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from '../../entities/order.entity';
import { Repository } from "typeorm";
import { UpdateOrderDto } from '../../dto/update-order.dto';
import { User } from '../../../users/entities/user.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { AddressesService } from '../../../addresses/addresses.service';
import { OrderDeliveryAddress } from '../../entities/order-delivery-address.entity';
import { NewAddressDataDto, CreateOrderDeliveryAddressDto } from '../../dto/create-order-delivery-address.dto';
import { Customer } from '../../../customers/entities/customer.entity';
import { CreateOrderDetailDto } from '../../dto/create-order-detail.dto';
import { ProductsService } from '../../../products/products.service';
import { OrderDetail } from '../../entities/order-detail.entity';
import { OrderType } from '../../../common/enums/order-type.enum';
import { AddFlowerToOrderDto } from '../../../flowers/dto/add-flower-to-order.dto';
import { FlowersService } from '../../../flowers/flowers.service';
import { OrderFlower } from '../../entities/order-flower.entity';
import { parseCurrency } from '../../utils/parse-currency.util';

@Injectable()
export class UpdateOrderUseCase {
    private readonly logger = new Logger(UpdateOrderUseCase.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderDeliveryAddress)
        private readonly orderDeliveryAddressRepository: Repository<OrderDeliveryAddress>,
        @InjectRepository(OrderDetail)
        private readonly orderDetailRepository: Repository<OrderDetail>,
        @InjectRepository(OrderFlower)
        private readonly orderFlowerRepository: Repository<OrderFlower>,
        private readonly addressesService: AddressesService,
        private readonly productsService: ProductsService,
        private readonly flowersService: FlowersService,
    ) { }

    async execute(updateOrderDto: UpdateOrderDto, user: User): Promise<Order> {
        const { id, deliveryDate, deliveryTime, deliveryAddress, details, flowers } = updateOrderDto;

        this.logger.log(`Starting update process for order with ID: ${id}`);

        const order = await this.orderRepository.findOne({
            where: { id },
            relations: {
                deliveryAddress: { commonAddress: true },
                customer: { address: true },
                details: { product: true },
                orderFlowers: { flower: true }
            }
        });

        if (!order) {
            this.logger.error(`Order with ID ${id} not found`);
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        if (order.status !== OrderStatus.CREATED) {
            this.logger.error(`Cannot update order with ID ${id} because it is not in CREATED status`);
            throw new BadRequestException(`Only orders in CREATED status can be updated`);
        }

        if (deliveryDate) order.deliveryDate = deliveryDate;
        if (deliveryTime) order.deliveryTime = deliveryTime;

        let totalAmount = this.calculateExistingTotal(order);

        if (deliveryAddress) {
            this.logger.log(`Updating delivery address for order with ID: ${id}`);
            await this.handleDeliveryAddress(deliveryAddress, order, user, order.customer);
        }

        if (details && details.length > 0) {
            this.logger.log(`Updating order details for order ${id}`)
            totalAmount += await this.handleOrderDetails(details, order, user);
        }

        if (flowers && flowers.length > 0 && order.orderType === OrderType.FLOR) {
            this.logger.log(`Updating order flowers for order ${id}`)
            await this.handleOrderFlowers(flowers, order, user);
        }

        const actualAdvencePayment = (updateOrderDto.advancePayment && updateOrderDto.advancePayment > parseCurrency(order.advancePayment)) ? updateOrderDto.advancePayment : parseCurrency(order.advancePayment);

        const remainingBalance = totalAmount - actualAdvencePayment;
        order.totalAmount = totalAmount;
        order.remainingBalance = remainingBalance;

        if (order.orderType === OrderType.VITRINA) order.paidAmount = remainingBalance;

        order.updatedBy = user;

        const updatedOrder = await this.orderRepository.save(order);
        this.logger.log(`Order with ID ${id} updated successfully`);

        return updatedOrder;
    }

    private async handleDeliveryAddress(deliveryAddress: CreateOrderDeliveryAddressDto, order: Order, user: User, customer: Customer): Promise<void> {
        if (!deliveryAddress) {
            this.logger.log(`No delivery address provided for order with ID: ${order.id}, skipping address update`);
            return;
        }

        const oldCommonId = order.deliveryAddress?.commonAddress?.id;
        let newCommonId: string | undefined;
        let deliveryAddressDto: NewAddressDataDto;

        if (deliveryAddress.useCustomerAddress) {
            this.logger.log(`Using customer's address for order with ID: ${order.id}`);

            if (!customer.address) {
                this.logger.error(`Customer with ID ${customer.id} does not have an address`);
                return;
            }

            deliveryAddressDto = this.buildDeliveryAddressDto(customer.address);
            newCommonId = undefined;

            if (order.deliveryAddress) {
                Object.assign(order.deliveryAddress, {
                    ...deliveryAddressDto,
                    deliveryNotes: deliveryAddress.deliveryNotes,
                    receiverName: deliveryAddress.receiverName,
                    receiverPhone: deliveryAddress.receiverPhone,
                    reference: deliveryAddress.reference,
                    commonAddress: null,
                });

                await this.orderDeliveryAddressRepository.save(order.deliveryAddress);

            } else {
                const customerDeliveryAddress = this.orderDeliveryAddressRepository.create({
                    ...deliveryAddressDto,
                    deliveryNotes: deliveryAddress.deliveryNotes,
                    order,
                    receiverName: deliveryAddress.receiverName,
                    receiverPhone: deliveryAddress.receiverPhone,
                    reference: deliveryAddress.reference,
                });

                await this.orderDeliveryAddressRepository.save(customerDeliveryAddress);
            }
        } else if (deliveryAddress.useCommonAddress) {
            this.logger.log('Using common address for delivery');

            const commonAddress = await this.addressesService.findOne(deliveryAddress.commonAddressId!);

            if (!commonAddress) {
                this.logger.warn(`Common address with ID ${deliveryAddress.commonAddressId} not found`);
                return;
            }

            deliveryAddressDto = this.buildDeliveryAddressDto(commonAddress);
            newCommonId = commonAddress.id;

            if (order.deliveryAddress) {
                Object.assign(order.deliveryAddress, {
                    ...deliveryAddressDto,
                    deliveryNotes: deliveryAddress.deliveryNotes,
                    receiverName: deliveryAddress.receiverName,
                    receiverPhone: deliveryAddress.receiverPhone,
                    reference: deliveryAddress.reference,
                    commonAddress,
                });

                await this.orderDeliveryAddressRepository.save(order.deliveryAddress);
            } else {
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
            }
        } else if (deliveryAddress.newAddress) {
            this.logger.log(`Using new address for order with ID: ${order.id}`);

            deliveryAddressDto = this.buildDeliveryAddressDto(deliveryAddress.newAddress);

            if (deliveryAddress.saveAsCommonAddress) {
                if (!deliveryAddress.commonAddressName) {
                    this.logger.warn('Common address name is required when saveAsCommonAddress is true');
                    return;
                }

                const newCommonAddress = await this.addressesService.create(
                    { ...deliveryAddressDto, name: deliveryAddress.commonAddressName },
                    user
                );

                newCommonId = newCommonAddress.id;

                if (order.deliveryAddress) {
                    Object.assign(order.deliveryAddress, {
                        ...deliveryAddressDto,
                        deliveryNotes: deliveryAddress.deliveryNotes,
                        receiverName: deliveryAddress.receiverName,
                        receiverPhone: deliveryAddress.receiverPhone,
                        reference: deliveryAddress.reference,
                        commonAddress: newCommonAddress,
                    });

                    await this.orderDeliveryAddressRepository.save(order.deliveryAddress);
                } else {
                    const newCommonDeliveryAddress = this.orderDeliveryAddressRepository.create({
                        ...deliveryAddressDto,
                        commonAddress: newCommonAddress,
                        deliveryNotes: deliveryAddress.deliveryNotes,
                        order,
                        receiverName: deliveryAddress.receiverName,
                        receiverPhone: deliveryAddress.receiverPhone,
                        reference: deliveryAddress.reference,
                    });

                    await this.orderDeliveryAddressRepository.save(newCommonDeliveryAddress);
                }

                await this.addressesService.incrementUsageCount(newCommonAddress.id);
            } else {
                newCommonId = undefined;

                if (order.deliveryAddress) {
                    Object.assign(order.deliveryAddress, {
                        ...deliveryAddressDto,
                        deliveryNotes: deliveryAddress.deliveryNotes,
                        receiverName: deliveryAddress.receiverName,
                        receiverPhone: deliveryAddress.receiverPhone,
                        reference: deliveryAddress.reference,
                        commonAddress: null,
                    });

                    await this.orderDeliveryAddressRepository.save(order.deliveryAddress);
                } else {
                    const orderDeliveryAddress = this.orderDeliveryAddressRepository.create({
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

        if (oldCommonId && oldCommonId !== newCommonId) {
            await this.addressesService.decrementUsageCount(oldCommonId);
        }

        if (newCommonId && oldCommonId !== newCommonId) {
            await this.addressesService.incrementUsageCount(newCommonId);
        }
    }

    private async handleOrderDetails(details: CreateOrderDetailDto[], order: Order, user: User,): Promise<number> {
        let totalAmount = 0;

        const productsPromises = details.map(detail => this.productsService.findProductByTerm(detail.productId));
        const products = await Promise.all(productsPromises);

        const existingDetails = order.details || [];
        const detailsToUpdate: OrderDetail[] = [];
        const detailsToCreate: OrderDetail[] = [];

        for (let i = 0; i < details.length; i++) {
            const detailDto = details[i];
            const product = products.find(p => p.id === detailDto.productId);

            if (!product) {
                this.logger.warn(`Product with ID ${detailDto.productId} not found, skipping this detail`);
                continue;
            }

            const existingDetail = existingDetails.find(d => d.product.id === detailDto.productId);

            if (existingDetail) {
                existingDetail.quantity = detailDto.quantity;
                existingDetail.price = detailDto.price;
                existingDetail.updatedBy = user;
                detailsToUpdate.push(existingDetail);
            } else {
                const newDetail = this.orderDetailRepository.create({
                    ...detailDto,
                    breadType: { id: detailDto.breadTypeId },
                    filling: { id: detailDto.fillingId },
                    flavor: { id: detailDto.flavorId },
                    frosting: { id: detailDto.frostingId },
                    style: { id: detailDto.styleId },
                    color: { id: detailDto.colorId },
                    order,
                    product,
                    createdBy: user,
                    updatedBy: user
                });

                detailsToCreate.push(newDetail);
            }

            totalAmount += detailDto.price * detailDto.quantity;
        }

        if (detailsToUpdate.length > 0) await this.orderDetailRepository.save(detailsToUpdate);
        if (detailsToCreate.length > 0) await this.orderDetailRepository.save(detailsToCreate);

        return totalAmount;
    }

    private async handleOrderFlowers(flowers: AddFlowerToOrderDto[], order: Order, user: User): Promise<void> {
        const flowersPromises = flowers.map(flower => this.flowersService.findOne(flower.flowerId));
        const flowersData = await Promise.all(flowersPromises);

        const existingFlowers = order.orderFlowers || [];
        const flowersToUpdate: OrderFlower[] = [];
        const flowersToCreate: OrderFlower[] = [];

        for (const flowerDto of flowers) {
            const flower = flowersData.find(f => f.id === flowerDto.flowerId);

            if (!flower) {
                this.logger.warn(`Flower with ID ${flowerDto.flowerId} not found, skipping this flower`);
                continue;
            }

            const existingFlower = existingFlowers.find(f => f.flower.id === flowerDto.flowerId);

            if (existingFlower) {
                existingFlower.quantity = flowerDto.quantity;
                existingFlower.updatedBy = user;
                flowersToUpdate.push(existingFlower);
            } else {
                const newFlower = this.orderFlowerRepository.create({
                    ...flowerDto,
                    color: { id: flowerDto.colorId },
                    order,
                    flower,
                    createdBy: user,
                    updatedBy: user
                });

                flowersToCreate.push(newFlower);
            }
        }

        if (flowersToUpdate.length > 0) await this.orderFlowerRepository.save(flowersToUpdate);
        if (flowersToCreate.length > 0) await this.orderFlowerRepository.save(flowersToCreate);
    }

    private calculateExistingTotal(order: Order): number {
        let total = 0;

        if (order.details) {
            total += order.details.reduce((sum, detail) => sum + (detail.price * detail.quantity), 0);
        }

        if (order.orderType === OrderType.EVENTO) {
            total += parseCurrency(order.dessertsTotal) + parseCurrency(order.setupServiceCost);
        }

        return total;
    }

    private buildDeliveryAddressDto(source: any): NewAddressDataDto {
        return {
            street: source.street,
            betweenStreets: source.betweenStreets,
            city: source.city,
            interphoneCode: source.interphoneCode,
            neighborhood: source.neighborhood,
            number: source.number,
            postalCode: source.postalCode
        }
    }
}