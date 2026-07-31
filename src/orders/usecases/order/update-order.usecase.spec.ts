import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateOrderUseCase } from './update-order.usecase';
import { OrderStatus } from '../../enums/order-status.enum';
import { OrderType } from '../../../common/enums/order-type.enum';
import type { User } from '../../../users/entities/user.entity';
import type { UpdateOrderDto } from '../../dto/update-order.dto';
import * as cloudinaryUtil from '../../../common/utils/upload-to-cloudinary';

jest.mock('../../../common/utils/upload-to-cloudinary');

const uploadPictureToCloudinaryMock =
    cloudinaryUtil.uploadPictureToCloudinary as jest.Mock;


function createMocks() {
    const orderRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const orderDeliveryAddressRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const orderDetailRepository = {
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

    const orderDetailReferenceImageRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entities) => Promise.resolve(entities)),
        count: jest.fn().mockResolvedValue(0),
    };
    const orderEmployeeActionRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };


    const addressesService = {
        findOne: jest.fn(),
        create: jest.fn(),
        incrementUsageCount: jest.fn().mockResolvedValue(undefined),
        decrementUsageCount: jest.fn().mockResolvedValue(undefined),
    };
    const productsService = { findProductByTerm: jest.fn() };
    const flowersService = { findOne: jest.fn() };
    const customersService = { findOne: jest.fn() };
    const branchesService = { findBranchByTerm: jest.fn() };
    const jwtService = {
        sign: jest.fn().mockReturnValue('signed-token'),
        verify: jest.fn().mockReturnValue({ id: 'admin-1', type: 'discount-authorization' }),
    };

    const useCase = new UpdateOrderUseCase(
        orderRepository as never,
        orderDeliveryAddressRepository as never,
        orderDetailRepository as never,
        orderFlowerRepository as never,
        orderPaymentRepository as never,
        orderDetailReferenceImageRepository as never,
        orderEmployeeActionRepository as never,
        addressesService as never,
        productsService as never,
        flowersService as never,
        customersService as never,
        branchesService as never,
        jwtService as never,
    );

    return {
        useCase,
        orderRepository,
        orderDeliveryAddressRepository,
        orderDetailRepository,
        orderFlowerRepository,
        orderPaymentRepository,
        orderDetailReferenceImageRepository,
        orderEmployeeActionRepository,
        addressesService,
        productsService,
        flowersService,
        customersService,
        branchesService,
        jwtService,
    };
}

const user = { id: 'user-1' } as User;
const employeeUser = { id: 'user-1', role: 'EMPLOYEE' } as User;

function baseOrder(overrides: Record<string, unknown> = {}) {
    return {
        id: 'order-1',
        status: OrderStatus.CREATED,
        orderType: OrderType.DOMICILIO,
        branch: { id: 'branch-1', name: 'Navarrete' },
        customer: { id: 'customer-1', address: null },
        details: [],
        orderFlowers: [],
        payments: [],
        deliveryAddress: undefined,
        setupServiceCost: 0,
        advancePayment: 0,
        paidAmount: 0,
        totalAmount: 0,
        ...overrides,
    };
}

function baseDto(overrides: Partial<UpdateOrderDto> = {}): UpdateOrderDto {
    return { id: 'order-1', ...overrides } as UpdateOrderDto;
}

describe('UpdateOrderUseCase', () => {
    beforeEach(() => {
        uploadPictureToCloudinaryMock.mockReset();
        uploadPictureToCloudinaryMock.mockResolvedValue('https://cdn/img.png');
    });

    it('lanza NotFoundException si el pedido no existe', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute(baseDto(), user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('lanza BadRequestException si el pedido no está en CREATED y se intentan actualizar detalles', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ status: OrderStatus.IN_PROCESS }),
        );

        await expect(
            mocks.useCase.execute(
                baseDto({ details: [{ productId: 'p1', price: 10, quantity: 1 }] as never }),
                user,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('permite actualizar campos que no son detalles aunque el pedido no esté en CREATED', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ status: OrderStatus.IN_PROCESS }),
        );

        await expect(
            mocks.useCase.execute(baseDto({ setupServiceCost: 50 }), user),
        ).resolves.toBeDefined();
    });

    it('actualiza la sucursal y regenera el código de pedido si branchId difiere', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        mocks.orderRepository.findOne.mockResolvedValueOnce(baseOrder());
        const newBranch = { id: 'branch-2', name: 'Centro' };
        mocks.branchesService.findBranchByTerm.mockResolvedValue(newBranch);
        // findOne para generateOrderCode (busca el último pedido del año)
        mocks.orderRepository.findOne.mockImplementation((opts: never) =>
            Promise.resolve(
                (opts as { where?: { id?: string } })?.where?.id === 'order-1'
                    ? baseOrder()
                    : null,
            ),
        );

        const result = await mocks.useCase.execute(
            baseDto({ branchId: 'branch-2' }),
            user,
        );

        expect(mocks.branchesService.findBranchByTerm).toHaveBeenCalledWith(
            'branch-2',
        );
        expect(result.branch).toEqual(newBranch);
        expect(result.orderCode).toMatch(/^DOM-CENTRO-\d{4}-0001$/);
    });

    it('actualiza el cliente si customerId difiere', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        const newCustomer = { id: 'customer-2', address: null };
        mocks.customersService.findOne.mockResolvedValue(newCustomer);

        const result = await mocks.useCase.execute(
            baseDto({ customerId: 'customer-2' }),
            user,
        );

        expect(mocks.customersService.findOne).toHaveBeenCalledWith('customer-2');
        expect(result.customer).toEqual(newCustomer);
    });

    it('no toca la dirección de entrega si isCustomerPickup viene definido', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());

        await mocks.useCase.execute(
            baseDto({
                isCustomerPickup: true,
                deliveryAddress: { useCustomerAddress: true } as never,
            }),
            user,
        );

        expect(mocks.orderDeliveryAddressRepository.save).not.toHaveBeenCalled();
        expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
    });

    it('actualiza in-place la dirección existente usando la dirección del cliente', async () => {
        const mocks = createMocks();
        const existingDeliveryAddress = {
            street: 'Vieja', receiverName: 'X', commonAddress: null,
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({
                customer: {
                    id: 'customer-1',
                    address: { street: 'Calle Nueva', number: '1', neighborhood: 'Centro' },
                },
                deliveryAddress: existingDeliveryAddress,
            }),
        );

        await mocks.useCase.execute(
            baseDto({
                deliveryAddress: {
                    useCustomerAddress: true,
                    receiverName: 'Ana',
                } as never,
            }),
            user,
        );

        expect(mocks.orderDeliveryAddressRepository.create).not.toHaveBeenCalled();
        expect(existingDeliveryAddress.street).toBe('Calle Nueva');
        expect(mocks.orderDeliveryAddressRepository.save).toHaveBeenCalledWith(
            existingDeliveryAddress,
        );
    });

    it('cambia de una dirección común a otra: decrementa la anterior e incrementa la nueva', async () => {
        const mocks = createMocks();
        const existingDeliveryAddress = {
            street: 'Vieja',
            commonAddress: { id: 'common-old' },
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ deliveryAddress: existingDeliveryAddress }),
        );
        const newCommonAddress = { id: 'common-new', street: 'Salón Nuevo' };
        mocks.addressesService.findOne.mockResolvedValue(newCommonAddress);

        await mocks.useCase.execute(
            baseDto({
                deliveryAddress: {
                    useCommonAddress: true,
                    commonAddressId: 'common-new',
                } as never,
            }),
            user,
        );

        expect(mocks.addressesService.decrementUsageCount).toHaveBeenCalledWith(
            'common-old',
        );
        expect(mocks.addressesService.incrementUsageCount).toHaveBeenCalledWith(
            'common-new',
        );
    });

    it('handleOrderDetails: actualiza un detalle existente y crea uno nuevo', async () => {
        const mocks = createMocks();
        const existingDetail = {
            product: { id: 'product-1' },
            quantity: 1,
            price: 50,
            breadType: { id: 'bt-old' },
            filling: {}, frosting: {}, style: {}, color: {},
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ details: [existingDetail] }),
        );
        mocks.productsService.findProductByTerm.mockImplementation((id: string) =>
            Promise.resolve({ id }),
        );

        await mocks.useCase.execute(
            baseDto({
                details: [
                    { productId: 'product-1', price: 80, quantity: 3, breadTypeId: 'bt-new' },
                    { productId: 'product-2', price: 20, quantity: 1 },
                ] as never,
            }),
            user,
        );

        expect(existingDetail.quantity).toBe(3);
        expect(existingDetail.price).toBe(80);
        expect(mocks.orderDetailRepository.save).toHaveBeenCalledTimes(2);
        const savedGroups = mocks.orderDetailRepository.save.mock.calls.map((c) => c[0]);
        expect(savedGroups).toContainEqual([existingDetail]);
        expect(
            savedGroups.some((group: never[]) =>
                (group as { product: { id: string } }[]).some(
                    (d) => d.product.id === 'product-2',
                ),
            ),
        ).toBe(true);
    });

    it('handleOrderDetails: falla por completo si un producto no existe (findProductByTerm siempre lanza)', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        mocks.productsService.findProductByTerm.mockRejectedValue(
            new Error('Product with term no-existe not found'),
        );

        await expect(
            mocks.useCase.execute(
                baseDto({
                    details: [{ productId: 'no-existe', price: 10, quantity: 1 }] as never,
                }),
                user,
            ),
        ).rejects.toThrow('Product with term no-existe not found');
    });

    it('handleOrderFlowers: solo se procesa si el pedido es de tipo FLOR', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ orderType: OrderType.DOMICILIO }),
        );

        await mocks.useCase.execute(
            baseDto({
                flowers: [{ flowerId: 'flower-1', quantity: 2 }] as never,
            }),
            user,
        );

        expect(mocks.flowersService.findOne).not.toHaveBeenCalled();
        expect(mocks.orderFlowerRepository.create).not.toHaveBeenCalled();
    });

    it('recalcula dessertsTotal/totalAmount sumando el costo de montaje', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({
                details: [{ product: { id: 'product-1' }, price: 100, quantity: 2 }],
            }),
        );

        const result = await mocks.useCase.execute(
            baseDto({ setupServiceCost: 30 }),
            user,
        );

        expect(result.dessertsTotal).toBe(200);
        expect(result.totalAmount).toBe(230);
    });

    it('aplica el anticipo solo si el pedido no tiene pagos previos', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ payments: [] }),
        );

        await mocks.useCase.execute(baseDto({ advancePayment: 100 }), user);

        expect(mocks.orderPaymentRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ paidAmount: 100 }),
        );
    });

    it('no vuelve a aplicar advancePayment si ya existen pagos', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ payments: [{ id: 'payment-1', paidAmount: 50 }] }),
        );

        await mocks.useCase.execute(baseDto({ advancePayment: 100 }), user);

        expect(mocks.orderPaymentRepository.create).not.toHaveBeenCalled();
    });

    it('un pago adicional se suma a paidAmount y se agrega a payments', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({
                payments: [{ id: 'payment-1', paidAmount: 50 }],
                paidAmount: 50,
                totalAmount: 200,
            }),
        );

        const result = await mocks.useCase.execute(baseDto({ payment: 150 }), user);

        expect(result.paidAmount).toBe(200);
        expect(result.payments).toHaveLength(2);
    });

    it('marca la liquidación cuando el saldo restante llega a 0', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({
                details: [{ price: 200, quantity: 1 }],
                payments: [{ id: 'payment-1', paidAmount: 50 }],
                paidAmount: 50,
            }),
        );

        const result = await mocks.useCase.execute(baseDto({ payment: 150 }), user);

        expect(result.remainingBalance).toBe(0);
        expect(result.settlementDate).toBeInstanceOf(Date);
        expect(result.settlementTotal).toBe(150);
    });

    it('handleOrderDetails: sube fotos de referencia nuevas para un detalle existente', async () => {
        process.env.NODE_ENV = 'production';
        const mocks = createMocks();
        const existingDetail = {
            id: 'detail-1',
            product: { id: 'product-1' },
            quantity: 1,
            price: 50,
            breadType: {}, filling: {}, frosting: {}, style: {}, color: {},
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ details: [existingDetail] }),
        );
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        const file0 = { buffer: Buffer.from('imagen') } as Express.Multer.File;

        await mocks.useCase.execute(
            baseDto({
                details: [
                    { productId: 'product-1', price: 50, quantity: 1 },
                ] as never,
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
        expect(mocks.orderDetailReferenceImageRepository.save).toHaveBeenCalledTimes(1);

        process.env.NODE_ENV = 'test';
    });

    it('handleOrderDetails: no sube nada si no llegan archivos', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        await mocks.useCase.execute(
            baseDto({
                details: [{ productId: 'product-1', price: 50, quantity: 1 }] as never,
            }),
            user,
        );

        expect(uploadPictureToCloudinaryMock).not.toHaveBeenCalled();
        expect(mocks.orderDetailReferenceImageRepository.save).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si un detalle trae descuento sin discountAuthToken', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        await expect(
            mocks.useCase.execute(
                baseDto({
                    details: [
                        { productId: 'product-1', price: 100, quantity: 2, discountPercent: 10 },
                    ] as never,
                }),
                user,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('aplica el descuento a un detalle nuevo cuando el discountAuthToken es válido', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        const result = await mocks.useCase.execute(
            baseDto({
                details: [
                    { productId: 'product-1', price: 100, quantity: 2, discountPercent: 10 },
                ] as never,
                discountAuthToken: 'valid-token',
            } as never),
            user,
        );

        expect(result.totalAmount).toBe(180);

        const createdDetails = mocks.orderDetailRepository.save.mock.calls.flatMap(
            (c) => c[0],
        );
        const discountedDetail = createdDetails.find(
            (d: never) => (d as { product: { id: string } }).product.id === 'product-1',
        );
        expect((discountedDetail as { discountAuthorizedBy: { id: string } }).discountAuthorizedBy).toEqual({
            id: 'admin-1',
        });
    });

    it('lanza BadRequestException si se intenta quitar un descuento existente sin discountAuthToken', async () => {
        const mocks = createMocks();
        const existingDetail = {
            product: { id: 'product-1' },
            quantity: 2,
            price: 100,
            discountPercent: 10,
            discountAuthorizedBy: { id: 'admin-1' },
            discountAuthorizedAt: new Date('2026-01-01'),
            breadType: {}, filling: {}, frosting: {}, style: {}, color: {},
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ details: [existingDetail] }),
        );
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        await expect(
            mocks.useCase.execute(
                baseDto({
                    details: [
                        { productId: 'product-1', price: 100, quantity: 2, discountPercent: 0 },
                    ] as never,
                }),
                user,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('quita el descuento y su autorización cuando se reenvía discountPercent en 0 con un discountAuthToken válido', async () => {
        const mocks = createMocks();
        const existingDetail = {
            product: { id: 'product-1' },
            quantity: 2,
            price: 100,
            discountPercent: 10,
            discountAuthorizedBy: { id: 'admin-1' },
            discountAuthorizedAt: new Date('2026-01-01'),
            breadType: {}, filling: {}, frosting: {}, style: {}, color: {},
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ details: [existingDetail] }),
        );
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        const result = await mocks.useCase.execute(
            baseDto({
                details: [
                    { productId: 'product-1', price: 100, quantity: 2, discountPercent: 0 },
                ] as never,
                discountAuthToken: 'valid-token',
            } as never),
            user,
        );

        expect(result.totalAmount).toBe(200);
        expect(existingDetail.discountAuthorizedBy).toBeNull();
        expect(existingDetail.discountAuthorizedAt).toBeUndefined();
    });

    it('no requiere discountAuthToken al re-guardar un descuento existente sin cambios', async () => {
        const mocks = createMocks();
        const existingDetail = {
            product: { id: 'product-1' },
            quantity: 2,
            price: 100,
            discountPercent: 10,
            discountAuthorizedBy: { id: 'admin-1' },
            discountAuthorizedAt: new Date('2026-01-01'),
            breadType: {}, filling: {}, frosting: {}, style: {}, color: {},
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ details: [existingDetail] }),
        );
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        const result = await mocks.useCase.execute(
            baseDto({
                details: [
                    { productId: 'product-1', price: 100, quantity: 2, discountPercent: 10 },
                ] as never,
            }),
            user,
        );

        expect(mocks.jwtService.verify).not.toHaveBeenCalled();
        expect(result.totalAmount).toBe(180);
        expect(existingDetail.discountAuthorizedBy).toEqual({ id: 'admin-1' });
    });

    it('no requiere discountAuthToken si ningún detalle enviado tiene descuento', async () => {
        const mocks = createMocks();
        mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

        await mocks.useCase.execute(
            baseDto({
                details: [{ productId: 'product-1', price: 100, quantity: 2 }] as never,
            }),
            user,
        );

        expect(mocks.jwtService.verify).not.toHaveBeenCalled();
    });

    it('handleOrderDetails: lanza BadRequestException si al sumar fotos existentes y nuevas se supera el máximo', async () => {
        const mocks = createMocks();
        const existingDetail = {
            id: 'detail-1',
            product: { id: 'product-1' },
            quantity: 1,
            price: 50,
            breadType: {}, filling: {}, frosting: {}, style: {}, color: {},
        };
        mocks.orderRepository.findOne.mockResolvedValue(
            baseOrder({ details: [existingDetail] }),
        );
        mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });
        mocks.orderDetailReferenceImageRepository.count.mockResolvedValue(9);

        const files = [
            { buffer: Buffer.from('a') } as Express.Multer.File,
            { buffer: Buffer.from('b') } as Express.Multer.File,
        ];

        await expect(
            mocks.useCase.execute(
                baseDto({
                    details: [{ productId: 'product-1', price: 50, quantity: 1 }] as never,
                    referenceImageDetailIndex: [0, 0] as never,
                }),
                user,
                files as never,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    describe('autoría de empleado (cuenta compartida de sucursal)', () => {
        it('lanza BadRequestException si una cuenta EMPLOYEE edita un pedido sin employeeActionToken', async () => {
            const mocks = createMocks();
            mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
            mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

            await expect(
                mocks.useCase.execute(
                    baseDto({
                        details: [{ productId: 'product-1', price: 100, quantity: 1 }] as never,
                    }),
                    employeeUser,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('registra el OrderEmployeeAction UPDATED cuando el employeeActionToken es válido', async () => {
            const mocks = createMocks();
            mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
            mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });
            mocks.jwtService.verify.mockReturnValue({
                employeeId: 'employee-1',
                type: 'employee-action',
            });

            await mocks.useCase.execute(
                baseDto({
                    details: [{ productId: 'product-1', price: 100, quantity: 1 }] as never,
                    employeeActionToken: 'valid-token',
                } as never),
                employeeUser,
            );

            expect(mocks.orderEmployeeActionRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    employee: { id: 'employee-1' },
                    action: 'UPDATED',
                }),
            );
            expect(mocks.orderEmployeeActionRepository.save).toHaveBeenCalled();
        });

        it('exige employeeActionToken incluso si el cambio no toca los detalles del pedido', async () => {
            const mocks = createMocks();
            mocks.orderRepository.findOne.mockResolvedValue(baseOrder());

            await expect(
                mocks.useCase.execute(
                    baseDto({ setupServiceCost: 50 }),
                    employeeUser,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('no exige employeeActionToken ni registra auditoría para roles distintos de EMPLOYEE', async () => {
            const mocks = createMocks();
            mocks.orderRepository.findOne.mockResolvedValue(baseOrder());
            mocks.productsService.findProductByTerm.mockResolvedValue({ id: 'product-1' });

            await mocks.useCase.execute(
                baseDto({
                    details: [{ productId: 'product-1', price: 100, quantity: 1 }] as never,
                }),
                user,
            );

            expect(mocks.orderEmployeeActionRepository.create).not.toHaveBeenCalled();
        });
    });

});
