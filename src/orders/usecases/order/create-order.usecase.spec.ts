import { CreateOrderUseCase } from './create-order.usecase';
import { OrderType } from '../../../common/enums/order-type.enum';
import * as cloudinaryUtil from '../../../common/utils/upload-to-cloudinary';
import type { User } from '../../../users/entities/user.entity';
import type { CreateOrderDto } from '../../dto/create-order.dto';
import { BadRequestException } from '@nestjs/common';

jest.mock('../../../common/utils/upload-to-cloudinary');

const uploadPictureToCloudinaryMock =
    cloudinaryUtil.uploadPictureToCloudinary as jest.Mock;

function createMocks() {
    const orderRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) =>
            Promise.resolve({ id: entity.id ?? 'order-1', ...entity }),
        ),
        findOne: jest.fn().mockResolvedValue(null),
    };
    const orderDeliveryAddressRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const orderDetailRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entities) => Promise.resolve(entities)),
    };
    const orderDetailReferenceImageRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entities) => Promise.resolve(entities)),
    };
    const orderFlowerRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entities) => Promise.resolve(entities)),
    };
    const orderPaymentRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const customerService = { findOne: jest.fn() };
    const branchesService = { findBranchByTerm: jest.fn() };
    const addressesService = {
        findOne: jest.fn(),
        incrementUsageCount: jest.fn().mockResolvedValue(undefined),
        create: jest.fn(),
    };
    const productsService = { findProductByTerm: jest.fn() };
    const flowersService = { findOne: jest.fn() };

    const useCase = new CreateOrderUseCase(
        orderRepository as never,
        orderDeliveryAddressRepository as never,
        orderDetailRepository as never,
        orderDetailReferenceImageRepository as never,
        orderFlowerRepository as never,
        orderPaymentRepository as never,
        customerService as never,
        branchesService as never,
        addressesService as never,
        productsService as never,
        flowersService as never,
    );

    return {
        useCase,
        orderRepository,
        orderDeliveryAddressRepository,
        orderDetailRepository,
        orderDetailReferenceImageRepository,
        orderFlowerRepository,
        orderPaymentRepository,
        customerService,
        branchesService,
        addressesService,
        productsService,
        flowersService,
    };

}

const user = { id: 'user-1' } as User;
const branch = { id: 'branch-1', name: 'Navarrete' };
const customerWithoutAddress = { id: 'customer-1', address: null };
const product = { id: 'product-1' };

function baseDetail(overrides: Record<string, unknown> = {}) {
    return {
        productId: 'product-1',
        price: 100,
        quantity: 2,
        ...overrides,
    };
}

function baseOrderDto(
    overrides: Partial<CreateOrderDto> = {},
): CreateOrderDto {
    return {
        orderType: OrderType.VITRINA,
        customerId: 'customer-1',
        branchId: 'branch-1',
        advancePayment: 0,
        isCustomerPickup: true,
        details: [baseDetail()],
        ...overrides,
    } as CreateOrderDto;
}

describe('CreateOrderUseCase', () => {
    beforeEach(() => {
        uploadPictureToCloudinaryMock.mockReset();
        uploadPictureToCloudinaryMock.mockResolvedValue('https://cdn/img.png');
    });

    describe('generateOrderCode (vía execute)', () => {
        it('genera secuencia 0001 cuando no hay pedidos previos ese año/tipo/sucursal', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.orderRepository.findOne.mockResolvedValue(null);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({ orderType: OrderType.DOMICILIO, isCustomerPickup: true }),
                user,
            );

            const createdOrder = mocks.orderRepository.create.mock.calls[0][0];
            expect(createdOrder.orderCode).toBe('DOM-NAVARRETE-' + new Date().getFullYear() + '-0001');
        });

        it('incrementa la secuencia a partir del último código encontrado', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.orderRepository.findOne.mockResolvedValue({
                orderCode: `DOM-NAVARRETE-${new Date().getFullYear()}-0007`,
            });
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({ orderType: OrderType.DOMICILIO, isCustomerPickup: true }),
                user,
            );

            const createdOrder = mocks.orderRepository.create.mock.calls[0][0];
            expect(createdOrder.orderCode).toBe('DOM-NAVARRETE-' + new Date().getFullYear() + '-0008');
        });

        it('reinicia a la secuencia 1 si el último código está malformado', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.orderRepository.findOne.mockResolvedValue({
                orderCode: 'CODIGO-INVALIDO',
            });
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({ orderType: OrderType.DOMICILIO, isCustomerPickup: true }),
                user,
            );

            const createdOrder = mocks.orderRepository.create.mock.calls[0][0];
            expect(createdOrder.orderCode).toBe('DOM-NAVARRETE-' + new Date().getFullYear() + '-0001');
        });
    });

    describe('manejo de dirección de entrega', () => {
        it('no procesa dirección si isCustomerPickup es true, aunque venga deliveryAddress', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.DOMICILIO,
                    isCustomerPickup: true,
                    deliveryAddress: { useCustomerAddress: true } as never,
                }),
                user,
            );

            expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
        });

        it('no procesa dirección para pedidos VITRINA aunque venga deliveryAddress', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.VITRINA,
                    isCustomerPickup: false,
                    deliveryAddress: { useCustomerAddress: true } as never,
                }),
                user,
            );

            expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
        });

        it('usa la dirección del cliente cuando useCustomerAddress es true', async () => {
            const mocks = createMocks();
            const customerWithAddress = {
                id: 'customer-1',
                address: {
                    street: 'Calle Reforma',
                    number: '123',
                    neighborhood: 'Centro',
                    city: 'Guadalajara',
                    postalCode: '44100',
                    interphoneCode: null,
                    betweenStreets: null,
                },
            };
            mocks.customerService.findOne.mockResolvedValue(customerWithAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.DOMICILIO,
                    isCustomerPickup: false,
                    deliveryAddress: {
                        useCustomerAddress: true,
                        receiverName: 'Ana',
                        receiverPhone: '5555555555',
                    } as never,
                }),
                user,
            );

            expect(mocks.orderDeliveryAddressRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    street: 'Calle Reforma',
                    receiverName: 'Ana',
                    receiverPhone: '5555555555',
                }),
            );
            expect(mocks.orderDeliveryAddressRepository.save).toHaveBeenCalled();
        });

        it('no crea dirección si useCustomerAddress es true pero el cliente no tiene dirección', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.DOMICILIO,
                    isCustomerPickup: false,
                    deliveryAddress: { useCustomerAddress: true } as never,
                }),
                user,
            );

            expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
        });

        it('usa una dirección común existente e incrementa su contador de uso', async () => {
            const mocks = createMocks();
            const commonAddress = {
                id: 'common-1',
                street: 'Av. Central',
                number: '9',
                neighborhood: 'Roma',
                city: 'CDMX',
            };
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);
            mocks.addressesService.findOne.mockResolvedValue(commonAddress);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.EVENTO,
                    isCustomerPickup: false,
                    deliveryAddress: {
                        useCommonAddress: true,
                        commonAddressId: 'common-1',
                    } as never,
                }),
                user,
            );

            expect(mocks.addressesService.incrementUsageCount).toHaveBeenCalledWith(
                'common-1',
            );
            expect(mocks.orderDeliveryAddressRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ commonAddress, street: 'Av. Central' }),
            );
        });

        it('no crea dirección si la dirección común no existe', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);
            mocks.addressesService.findOne.mockResolvedValue(null);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.EVENTO,
                    isCustomerPickup: false,
                    deliveryAddress: {
                        useCommonAddress: true,
                        commonAddressId: 'no-existe',
                    } as never,
                }),
                user,
            );

            expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
        });

        it('crea una dirección nueva ad-hoc sin guardarla como común', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.DOMICILIO,
                    isCustomerPickup: false,
                    deliveryAddress: {
                        newAddress: {
                            street: 'Calle Nueva',
                            number: '1',
                            neighborhood: 'Norte',
                        },
                    } as never,
                }),
                user,
            );

            expect(mocks.addressesService.create).not.toHaveBeenCalled();
            expect(mocks.orderDeliveryAddressRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ street: 'Calle Nueva' }),
            );
        });

        it('guarda la dirección nueva como común cuando saveAsCommonAddress es true', async () => {
            const mocks = createMocks();
            const newCommonAddress = { id: 'common-new' };
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);
            mocks.addressesService.create.mockResolvedValue(newCommonAddress);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.EVENTO,
                    isCustomerPickup: false,
                    deliveryAddress: {
                        newAddress: {
                            street: 'Salón Central',
                            number: '1',
                            neighborhood: 'Centro',
                        },
                        saveAsCommonAddress: true,
                        commonAddressName: 'Salón Central',
                    } as never,
                }),
                user,
            );

            expect(mocks.addressesService.create).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Salón Central' }),
                user,
            );
            expect(mocks.addressesService.incrementUsageCount).toHaveBeenCalledWith(
                'common-new',
            );
            expect(mocks.orderDeliveryAddressRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ commonAddress: newCommonAddress }),
            );
        });

        it('no guarda como común si falta commonAddressName', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.EVENTO,
                    isCustomerPickup: false,
                    deliveryAddress: {
                        newAddress: { street: 'X', number: '1', neighborhood: 'Y' },
                        saveAsCommonAddress: true,
                    } as never,
                }),
                user,
            );

            expect(mocks.addressesService.create).not.toHaveBeenCalled();
            expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('manejo de flores', () => {
        it('crea un OrderFlower por cada flor cuando se envían', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);
            mocks.flowersService.findOne.mockResolvedValue({ id: 'flower-1' });

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.FLOR,
                    isCustomerPickup: true,
                    flowers: [
                        { flowerId: 'flower-1', colorId: 'color-1', quantity: 3 },
                    ] as never,
                }),
                user,
            );

            expect(mocks.orderFlowerRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    flower: { id: 'flower-1' },
                    color: { id: 'color-1' },
                    quantity: 3,
                }),
            );
            expect(mocks.orderFlowerRepository.save).toHaveBeenCalled();
        });

        it('no toca OrderFlower cuando no se envían flores', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(baseOrderDto(), user);

            expect(mocks.orderFlowerRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('calculateOrderTotal', () => {
        const originalNodeEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalNodeEnv;
        });

        it('VITRINA no suma el costo de montaje al total', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.VITRINA,
                    advancePayment: 50,
                    setupServiceCost: 30,
                    details: [baseDetail({ price: 100, quantity: 2 })],
                }),
                user,
            );

            const savedOrderCalls = mocks.orderRepository.save.mock.calls;
            const finalOrder = savedOrderCalls[savedOrderCalls.length - 1][0];

            expect(finalOrder.dessertsTotal).toBe(200);
            expect(finalOrder.totalAmount).toBe(200);
            expect(finalOrder.remainingBalance).toBe(150);
            expect(finalOrder.paidAmount).toBe(50);
        });

        it('DOMICILIO sí suma el costo de montaje al total', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({
                    orderType: OrderType.DOMICILIO,
                    isCustomerPickup: true,
                    advancePayment: 100,
                    setupServiceCost: 30,
                    details: [baseDetail({ price: 100, quantity: 2 })],
                }),
                user,
            );

            const savedOrderCalls = mocks.orderRepository.save.mock.calls;
            const finalOrder = savedOrderCalls[savedOrderCalls.length - 1][0];

            expect(finalOrder.dessertsTotal).toBe(200);
            expect(finalOrder.totalAmount).toBe(230);
            expect(finalOrder.remainingBalance).toBe(130);
        });

        it('crea un OrderPayment con el anticipo', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            await mocks.useCase.execute(
                baseOrderDto({ advancePayment: 75 }),
                user,
            );

            expect(mocks.orderPaymentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ paidAmount: 75 }),
            );
            expect(mocks.orderPaymentRepository.save).toHaveBeenCalled();
        });

        it('si un producto no existe, la creación del pedido falla por completo (findProductByTerm siempre lanza, nunca retorna undefined)', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockImplementation((id: string) =>
                id === 'product-1'
                    ? Promise.resolve(product)
                    : Promise.reject(new Error(`Product with term ${id} not found`)),
            );

            await expect(
                mocks.useCase.execute(
                    baseOrderDto({
                        details: [
                            baseDetail({ productId: 'product-1', price: 100, quantity: 1 }),
                            baseDetail({ productId: 'no-existe', price: 999, quantity: 1 }),
                        ],
                    }),
                    user,
                ),
            ).rejects.toThrow('Product with term no-existe not found');

            expect(mocks.orderDetailRepository.save).not.toHaveBeenCalled();
        });

        it('sube la imagen de referencia solo para el detalle indicado en referenceImageDetailIndex, usando la carpeta según NODE_ENV', async () => {
            process.env.NODE_ENV = 'production';
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            const file0 = { buffer: Buffer.from('imagen') } as Express.Multer.File;

            await mocks.useCase.execute(
                baseOrderDto({
                    details: [
                        baseDetail({ price: 50, quantity: 1 }),
                        baseDetail({ price: 50, quantity: 1 }),
                    ],
                    referenceImageDetailIndex: [0] as never,
                }),
                user,
                [file0] as never,
            );

            expect(uploadPictureToCloudinaryMock).toHaveBeenCalledTimes(1);
            expect(uploadPictureToCloudinaryMock).toHaveBeenCalledWith(
                file0.buffer,
                'magnolias/orders/reference-images',
                expect.any(String),
            );
            expect(
                mocks.orderDetailReferenceImageRepository.create,
            ).toHaveBeenCalledTimes(1);
            expect(
                mocks.orderDetailReferenceImageRepository.save,
            ).toHaveBeenCalledTimes(1);
        });

        it('permite varias fotos de referencia para un mismo detalle', async () => {
            process.env.NODE_ENV = 'production';
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            const file0 = { buffer: Buffer.from('a') } as Express.Multer.File;
            const file1 = { buffer: Buffer.from('b') } as Express.Multer.File;

            await mocks.useCase.execute(
                baseOrderDto({
                    details: [baseDetail({ price: 50, quantity: 1 })],
                    referenceImageDetailIndex: [0, 0] as never,
                }),
                user,
                [file0, file1] as never,
            );

            expect(uploadPictureToCloudinaryMock).toHaveBeenCalledTimes(2);
            expect(
                mocks.orderDetailReferenceImageRepository.create,
            ).toHaveBeenCalledTimes(2);
            expect(
                mocks.orderDetailReferenceImageRepository.save,
            ).toHaveBeenCalledTimes(1);
        });

        it('lanza BadRequestException si un detalle recibe más de 10 imágenes de referencia', async () => {
            const mocks = createMocks();
            mocks.customerService.findOne.mockResolvedValue(customerWithoutAddress);
            mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
            mocks.productsService.findProductByTerm.mockResolvedValue(product);

            const files = Array.from(
                { length: 11 },
                (_, i) => ({ buffer: Buffer.from(String(i)) }) as Express.Multer.File,
            );
            const referenceImageDetailIndex = files.map(() => 0);

            await expect(
                mocks.useCase.execute(
                    baseOrderDto({
                        details: [baseDetail({ price: 50, quantity: 1 })],
                        referenceImageDetailIndex: referenceImageDetailIndex as never,
                    }),
                    user,
                    files as never,
                ),
            ).rejects.toThrow(BadRequestException);

            expect(mocks.orderDetailRepository.save).not.toHaveBeenCalled();
        });
    });
});