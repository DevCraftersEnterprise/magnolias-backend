import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateOrderUseCase } from './update-order.usecase';
import { OrderStatus } from '../../enums/order-status.enum';
import { OrderType } from '../../../common/enums/order-type.enum';
import type { User } from '../../../users/entities/user.entity';
import type { UpdateOrderDto } from '../../dto/update-order.dto';

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

    const useCase = new UpdateOrderUseCase(
        orderRepository as never,
        orderDeliveryAddressRepository as never,
        orderDetailRepository as never,
        orderFlowerRepository as never,
        orderPaymentRepository as never,
        addressesService as never,
        productsService as never,
        flowersService as never,
        customersService as never,
        branchesService as never,
    );

    return {
        useCase,
        orderRepository,
        orderDeliveryAddressRepository,
        orderDetailRepository,
        orderFlowerRepository,
        orderPaymentRepository,
        addressesService,
        productsService,
        flowersService,
        customersService,
        branchesService,
    };
}

const user = { id: 'user-1' } as User;

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
            filling: {}, flavor: {}, frosting: {}, style: {}, color: {},
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
});
