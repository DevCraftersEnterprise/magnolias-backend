import { OrdersService } from './orders.service';
import { OrderStatus } from './enums/order-status.enum';
import type { User } from '../users/entities/user.entity';

function createMocks() {
    const createOrderUseCase = { execute: jest.fn() };
    const setPickupPersonUseCase = { execute: jest.fn() };
    const findAllOrdersUseCase = { execute: jest.fn() };
    const findOneOrderUseCase = { execute: jest.fn() };
    const updateOrderUseCase = { execute: jest.fn() };
    const changeOrderStatusUseCase = { execute: jest.fn() };
    const getOrderStatsUseCase = { execute: jest.fn() };
    const assignOrderDetailUseCase = { execute: jest.fn() };
    const getBakerDetailAssignmentsUseCase = { execute: jest.fn() };
    const updateProductionStatusUseCase = { execute: jest.fn() };
    const hideOrderDetailReferenceImageUseCase = { execute: jest.fn() };

    const service = new OrdersService(
        createOrderUseCase as never,
        setPickupPersonUseCase as never,
        findAllOrdersUseCase as never,
        findOneOrderUseCase as never,
        updateOrderUseCase as never,
        changeOrderStatusUseCase as never,
        getOrderStatsUseCase as never,
        assignOrderDetailUseCase as never,
        getBakerDetailAssignmentsUseCase as never,
        updateProductionStatusUseCase as never,
        hideOrderDetailReferenceImageUseCase as never,
    );

    return {
        service,
        createOrderUseCase,
        setPickupPersonUseCase,
        findAllOrdersUseCase,
        findOneOrderUseCase,
        updateOrderUseCase,
        changeOrderStatusUseCase,
        getOrderStatsUseCase,
        assignOrderDetailUseCase,
        getBakerDetailAssignmentsUseCase,
        updateProductionStatusUseCase,
        hideOrderDetailReferenceImageUseCase,
    };
}

const user = { id: 'user-1' } as User;

describe('OrdersService', () => {
    describe('getOrderByTerm', () => {
        it('por defecto no pide transferAccount (protege el dato)', async () => {
            const { service, findOneOrderUseCase } = createMocks();
            findOneOrderUseCase.execute.mockResolvedValue({ id: 'order-1' });

            await service.getOrderByTerm('order-1');

            expect(findOneOrderUseCase.execute).toHaveBeenCalledWith(
                'order-1',
                false,
            );
        });

        it('propaga includeTransferAccount cuando se pide explícitamente (uso del PDF)', async () => {
            const { service, findOneOrderUseCase } = createMocks();
            findOneOrderUseCase.execute.mockResolvedValue({ id: 'order-1' });

            await service.getOrderByTerm('order-1', true);

            expect(findOneOrderUseCase.execute).toHaveBeenCalledWith(
                'order-1',
                true,
            );
        });
    });

    it('createOrder delega en CreateOrderUseCase', async () => {
        const { service, createOrderUseCase } = createMocks();
        createOrderUseCase.execute.mockResolvedValue({ id: 'order-1' });

        const result = await service.createOrder({} as never, user);

        expect(createOrderUseCase.execute).toHaveBeenCalledWith(
            {},
            user,
            undefined,
        );
        expect(result).toEqual({ id: 'order-1' });
    });

    it('setPickupPerson delega en SetPickupPersonUseCase', async () => {
        const { service, setPickupPersonUseCase } = createMocks();
        setPickupPersonUseCase.execute.mockResolvedValue({ id: 'order-1' });

        await service.setPickupPerson('order-1', {} as never, user);

        expect(setPickupPersonUseCase.execute).toHaveBeenCalledWith(
            'order-1',
            {},
            user,
        );
    });

    it('getOrders delega en FindAllOrdersUseCase', async () => {
        const { service, findAllOrdersUseCase } = createMocks();
        findAllOrdersUseCase.execute.mockResolvedValue([]);

        await service.getOrders({} as never, 'branch-1');

        expect(findAllOrdersUseCase.execute).toHaveBeenCalledWith(
            {},
            'branch-1',
        );
    });

    it('updateOrder delega en UpdateOrderUseCase', async () => {
        const { service, updateOrderUseCase } = createMocks();
        updateOrderUseCase.execute.mockResolvedValue({ id: 'order-1' });

        await service.updateOrder({} as never, user);

        expect(updateOrderUseCase.execute).toHaveBeenCalledWith(
            {},
            user,
            undefined,
        );
    });

    it('hideOrderDetailReferenceImage delega en HideOrderDetailReferenceImageUseCase', async () => {
        const { service, hideOrderDetailReferenceImageUseCase } = createMocks();

        await service.hideOrderDetailReferenceImage('image-1', user);

        expect(
            hideOrderDetailReferenceImageUseCase.execute,
        ).toHaveBeenCalledWith('image-1', user);
    });

    it.each([
        ['markOrderAsInProcess', OrderStatus.IN_PROCESS],
        ['markOrderAsDone', OrderStatus.DONE],
        ['markOrderAsDelivered', OrderStatus.DELIVERED],
    ] as const)('%s delega en ChangeOrderStatusUseCase con %s', async (method, status) => {
        const { service, changeOrderStatusUseCase } = createMocks();
        changeOrderStatusUseCase.execute.mockResolvedValue({ id: 'order-1' });

        await service[method]({} as never, user);

        expect(changeOrderStatusUseCase.execute).toHaveBeenCalledWith(
            {},
            status,
            user,
        );
    });

    it('markOrderAsCancel delega en ChangeOrderStatusUseCase con el motivo de cancelación', async () => {
        const { service, changeOrderStatusUseCase } = createMocks();
        const dto = { reason: 'Cliente canceló' };
        changeOrderStatusUseCase.execute.mockResolvedValue({ id: 'order-1' });

        await service.markOrderAsCancel(dto as never, user);

        expect(changeOrderStatusUseCase.execute).toHaveBeenCalledWith(
            dto,
            OrderStatus.CANCELED,
            user,
            dto,
        );
    });

    it('getStats delega en GetOrderStatsUseCase', async () => {
        const { service, getOrderStatsUseCase } = createMocks();
        getOrderStatsUseCase.execute.mockResolvedValue({});

        await service.getStats(user, 'branch-1');

        expect(getOrderStatsUseCase.execute).toHaveBeenCalledWith(
            user,
            'branch-1',
        );
    });

    it('assignOrderDetail delega en AssignOrderDetailUseCase', async () => {
        const { service, assignOrderDetailUseCase } = createMocks();
        assignOrderDetailUseCase.execute.mockResolvedValue({ id: 'assignment-1' });

        await service.assignOrderDetail('detail-1', {} as never, user);

        expect(assignOrderDetailUseCase.execute).toHaveBeenCalledWith(
            'detail-1',
            {},
            user,
        );
    });

    it('getBakerDetailAssignments delega en GetBakerDetailAssignmentsUseCase', async () => {
        const { service, getBakerDetailAssignmentsUseCase } = createMocks();
        getBakerDetailAssignmentsUseCase.execute.mockResolvedValue([]);

        await service.getBakerDetailAssignments('baker-1');

        expect(getBakerDetailAssignmentsUseCase.execute).toHaveBeenCalledWith(
            'baker-1',
        );
    });

    it('updateProductionStatus delega en UpdateProductionStatusUseCase', async () => {
        const { service, updateProductionStatusUseCase } = createMocks();
        updateProductionStatusUseCase.execute.mockResolvedValue({ id: 'detail-1' });

        await service.updateProductionStatus('detail-1', {} as never, user);

        expect(updateProductionStatusUseCase.execute).toHaveBeenCalledWith(
            'detail-1',
            {},
            user,
        );
    });
});
