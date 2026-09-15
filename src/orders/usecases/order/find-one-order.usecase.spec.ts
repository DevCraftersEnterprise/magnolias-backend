import { NotFoundException } from '@nestjs/common';
import { FindOneOrderUseCase } from './find-one-order.usecase';

describe('FindOneOrderUseCase', () => {
    function createMocks() {
        const orderRepository = { findOne: jest.fn() };
        const useCase = new FindOneOrderUseCase(orderRepository as never);
        return { useCase, orderRepository };
    }

    it('retorna el pedido con sus relaciones cuando existe', async () => {
        const { useCase, orderRepository } = createMocks();
        const order = { id: 'order-1' };
        orderRepository.findOne.mockResolvedValue(order);

        const result = await useCase.execute('order-1');

        expect(orderRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'order-1' },
                relations: expect.objectContaining({
                    employeeActions: { employee: true },
                    deliveryAssignments: { driver: true },
                }),
            }),
        );
        expect(result).toBe(order);
    });

    it('lanza NotFoundException si el pedido no existe', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute('no-existe')).rejects.toThrow(
            NotFoundException,
        );
    });

    describe('transferAccount', () => {
        it('se oculta por defecto (no se pide includeTransferAccount)', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                transferAccount: 'BBVA 1234567890',
            });

            const result = await useCase.execute('order-1');

            expect(result.transferAccount).toBeUndefined();
        });

        it('se oculta explícitamente cuando includeTransferAccount es false', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                transferAccount: 'BBVA 1234567890',
            });

            const result = await useCase.execute('order-1', false);

            expect(result.transferAccount).toBeUndefined();
        });

        it('se incluye cuando includeTransferAccount es true (uso exclusivo del PDF)', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                transferAccount: 'BBVA 1234567890',
            });

            const result = await useCase.execute('order-1', true);

            expect(result.transferAccount).toBe('BBVA 1234567890');
        });
    });

    describe('saneamiento de datos sensibles en relaciones', () => {
        // Este proyecto no registra un ClassSerializerInterceptor global, así
        // que @Exclude()/@ApiHideProperty() en User.userkey y
        // BranchEmployee.pin no ocultan nada por sí solos.
        it('quita userkey de createdBy y updatedBy', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                createdBy: { id: 'u1', name: 'Sucursal', userkey: 'hash' },
                updatedBy: { id: 'u1', name: 'Sucursal', userkey: 'hash' },
            });

            const result = await useCase.execute('order-1');

            expect(result.createdBy).not.toHaveProperty('userkey');
            expect(result.updatedBy).not.toHaveProperty('userkey');
        });

        it('quita el pin del empleado en employeeActions', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                employeeActions: [
                    {
                        action: 'CREATED',
                        employee: { id: 'e1', name: 'María', pin: 'hash' },
                    },
                ],
            });

            const result = await useCase.execute('order-1');

            expect(result.employeeActions[0].employee).not.toHaveProperty(
                'pin',
            );
            expect(result.employeeActions[0].employee.name).toBe('María');
        });

        it('quita userkey de discountAuthorizedBy y del baker asignado en cada detalle', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                details: [
                    {
                        id: 'd1',
                        discountAuthorizedBy: { id: 'u2', userkey: 'hash' },
                        assignments: [
                            { id: 'a1', baker: { id: 'u3', userkey: 'hash' } },
                        ],
                    },
                ],
            });

            const result = await useCase.execute('order-1');

            expect(result.details[0].discountAuthorizedBy).not.toHaveProperty(
                'userkey',
            );
            expect(
                result.details[0].assignments![0].baker,
            ).not.toHaveProperty('userkey');
        });

        it('quita userkey del repartidor en deliveryAssignments (cliente #8)', async () => {
            const { useCase, orderRepository } = createMocks();
            orderRepository.findOne.mockResolvedValue({
                id: 'order-1',
                deliveryAssignments: [
                    { id: 'da1', driver: { id: 'u4', userkey: 'hash' } },
                ],
            });

            const result = await useCase.execute('order-1');

            expect(
                result.deliveryAssignments[0].driver,
            ).not.toHaveProperty('userkey');
        });
    });
});
