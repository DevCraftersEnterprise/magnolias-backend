import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangeOrderStatusUseCase } from './change-order-status.usecase';
import { OrderStatus } from '../../enums/order-status.enum';
import { OrderEmployeeActionType } from '../../enums/order-employee-action-type.enum';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const orderRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const cancellationRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const orderEmployeeActionRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const orderDeliveryAssignmentRepository = {
        findOne: jest.fn(),
    };
    const jwtService = {
        verify: jest.fn().mockReturnValue({
            employeeId: 'employee-1',
            type: 'employee-action',
        }),
    };

    const useCase = new ChangeOrderStatusUseCase(
        orderRepository as never,
        cancellationRepository as never,
        orderEmployeeActionRepository as never,
        orderDeliveryAssignmentRepository as never,
        jwtService as never,
    );

    return {
        useCase,
        orderRepository,
        cancellationRepository,
        orderEmployeeActionRepository,
        orderDeliveryAssignmentRepository,
        jwtService,
    };
}

const user = { id: 'user-1' } as User;
const employeeUser = { id: 'user-1', role: 'EMPLOYEE' } as User;

describe('ChangeOrderStatusUseCase', () => {
    it('lanza NotFoundException si el pedido no existe', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue(null);

        await expect(
            useCase.execute({ id: 'order-1' } as never, OrderStatus.DONE, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el pedido ya está cancelado', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue({
            id: 'order-1',
            status: OrderStatus.CANCELED,
        });

        await expect(
            useCase.execute({ id: 'order-1' } as never, OrderStatus.DONE, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('rechaza cancelar un pedido que ya no está en estado Creado (cliente)', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue({
            id: 'order-1',
            status: OrderStatus.IN_PROCESS,
        });

        await expect(
            useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.CANCELED,
                user,
                { reason: 'x' } as never,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('cambia el estado y actualiza updatedBy', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue({
            id: 'order-1',
            status: OrderStatus.IN_PROCESS,
        });

        const result = await useCase.execute(
            { id: 'order-1' } as never,
            OrderStatus.DONE,
            user,
        );

        expect(orderRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ status: OrderStatus.DONE, updatedBy: user }),
        );
        expect(result.status).toBe(OrderStatus.DONE);
    });

    it('crea un registro de cancelación cuando se cancela con motivo', async () => {
        const { useCase, orderRepository, cancellationRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue({
            id: 'order-1',
            status: OrderStatus.CREATED,
        });

        await useCase.execute(
            { id: 'order-1' } as never,
            OrderStatus.CANCELED,
            user,
            { reason: 'Cliente canceló' } as never,
        );

        expect(cancellationRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                description: 'Cliente canceló',
                canceledBy: user,
            }),
        );
        expect(cancellationRepository.save).toHaveBeenCalled();
    });

    it('no crea registro de cancelación si se cancela sin motivo', async () => {
        const { useCase, orderRepository, cancellationRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue({
            id: 'order-1',
            status: OrderStatus.CREATED,
        });

        await useCase.execute(
            { id: 'order-1' } as never,
            OrderStatus.CANCELED,
            user,
        );

        expect(cancellationRepository.create).not.toHaveBeenCalled();
    });

    describe('autoría de empleado (cuenta compartida de sucursal)', () => {
        it('no exige employeeActionToken para IN_PROCESS aunque el usuario sea EMPLOYEE', async () => {
            const { useCase, orderRepository, jwtService } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.CREATED,
            });

            await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.IN_PROCESS,
                employeeUser,
            );

            expect(jwtService.verify).not.toHaveBeenCalled();
        });

        it('no exige employeeActionToken para DONE aunque el usuario sea EMPLOYEE', async () => {
            const { useCase, orderRepository, jwtService } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_PROCESS,
            });

            await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.DONE,
                employeeUser,
            );

            expect(jwtService.verify).not.toHaveBeenCalled();
        });

        it('lanza BadRequestException si un EMPLOYEE marca DELIVERED sin employeeActionToken', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.DONE,
            });

            await expect(
                useCase.execute(
                    { id: 'order-1' } as never,
                    OrderStatus.DELIVERED,
                    employeeUser,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('registra el OrderEmployeeAction DELIVERED cuando el token es válido', async () => {
            const { useCase, orderRepository, orderEmployeeActionRepository } =
                createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_DELIVERY,
                remainingBalance: '0',
            });

            await useCase.execute(
                { id: 'order-1', employeeActionToken: 'valid-token' } as never,
                OrderStatus.DELIVERED,
                employeeUser,
            );

            expect(orderEmployeeActionRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    employee: { id: 'employee-1' },
                    action: OrderEmployeeActionType.DELIVERED,
                }),
            );
            expect(orderEmployeeActionRepository.save).toHaveBeenCalled();
        });

        it('lanza BadRequestException si un EMPLOYEE cancela sin employeeActionToken', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.CREATED,
            });

            await expect(
                useCase.execute(
                    { id: 'order-1' } as never,
                    OrderStatus.CANCELED,
                    employeeUser,
                    { reason: 'Cliente canceló' } as never,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('registra el OrderEmployeeAction CANCELED usando el token del cancelOrderDto', async () => {
            const { useCase, orderRepository, orderEmployeeActionRepository } =
                createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.CREATED,
            });

            await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.CANCELED,
                employeeUser,
                {
                    reason: 'Cliente canceló',
                    employeeActionToken: 'valid-token',
                } as never,
            );

            expect(orderEmployeeActionRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    employee: { id: 'employee-1' },
                    action: OrderEmployeeActionType.CANCELED,
                }),
            );
        });

        it('no exige employeeActionToken para ADMIN/SUPER/BAKER', async () => {
            const { useCase, orderRepository, jwtService } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_DELIVERY,
                remainingBalance: '0',
            });

            await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.DELIVERED,
                { id: 'admin-1', role: 'ADMIN' } as User,
            );

            expect(jwtService.verify).not.toHaveBeenCalled();
        });
    });

    describe('validación de repartidor asignado (cliente #8)', () => {
        const driverUser = { id: 'driver-1', role: 'DRIVER' } as User;

        it('lanza BadRequestException si el repartidor no tiene una entrega asignada', async () => {
            const { useCase, orderRepository, orderDeliveryAssignmentRepository } =
                createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_DELIVERY,
                remainingBalance: '0',
            });
            orderDeliveryAssignmentRepository.findOne.mockResolvedValue(null);

            await expect(
                useCase.execute(
                    { id: 'order-1' } as never,
                    OrderStatus.DELIVERED,
                    driverUser,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('lanza BadRequestException si el repartidor asignado es otro distinto al que marca la entrega', async () => {
            const { useCase, orderRepository, orderDeliveryAssignmentRepository } =
                createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_DELIVERY,
                remainingBalance: '0',
            });
            orderDeliveryAssignmentRepository.findOne.mockResolvedValue({
                driver: { id: 'driver-other' },
            });

            await expect(
                useCase.execute(
                    { id: 'order-1' } as never,
                    OrderStatus.DELIVERED,
                    driverUser,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('permite marcar como entregado al repartidor asignado', async () => {
            const { useCase, orderRepository, orderDeliveryAssignmentRepository } =
                createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_DELIVERY,
                remainingBalance: '0',
            });
            orderDeliveryAssignmentRepository.findOne.mockResolvedValue({
                driver: { id: 'driver-1' },
            });

            const result = await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.DELIVERED,
                driverUser,
            );

            expect(result.status).toBe(OrderStatus.DELIVERED);
        });
    });

    describe('validación de estado y saldo antes de entregar (cliente: no entregar con saldo pendiente)', () => {
        it('rechaza DELIVERED si el pedido tiene saldo pendiente', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.IN_DELIVERY,
                remainingBalance: '150.00',
            });

            await expect(
                useCase.execute(
                    { id: 'order-1' } as never,
                    OrderStatus.DELIVERED,
                    { id: 'admin-1', role: 'ADMIN' } as User,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('rechaza DELIVERED si un pedido con reparto no está en IN_DELIVERY', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.DONE,
                remainingBalance: '0',
            });

            await expect(
                useCase.execute(
                    { id: 'order-1' } as never,
                    OrderStatus.DELIVERED,
                    { id: 'admin-1', role: 'ADMIN' } as User,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('permite DELIVERED desde DONE directo para un pedido en tienda (isEnTienda), sin pasar por IN_DELIVERY', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.DONE,
                remainingBalance: '0',
                isEnTienda: true,
            });

            const result = await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.DELIVERED,
                { id: 'admin-1', role: 'ADMIN' } as User,
            );

            expect(result.status).toBe(OrderStatus.DELIVERED);
        });

        it('permite DELIVERED desde DONE directo para un pedido de recolección por cliente (isCustomerPickup)', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                status: OrderStatus.DONE,
                remainingBalance: '0',
                isCustomerPickup: true,
            });

            const result = await useCase.execute(
                { id: 'order-1' } as never,
                OrderStatus.DELIVERED,
                { id: 'admin-1', role: 'ADMIN' } as User,
            );

            expect(result.status).toBe(OrderStatus.DELIVERED);
        });
    });
});
