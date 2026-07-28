import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangeOrderStatusUseCase } from './change-order-status.usecase';
import { OrderStatus } from '../../enums/order-status.enum';
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

    const useCase = new ChangeOrderStatusUseCase(
        orderRepository as never,
        cancellationRepository as never,
    );

    return { useCase, orderRepository, cancellationRepository };
}

const user = { id: 'user-1' } as User;

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
            status: OrderStatus.IN_PROCESS,
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
            status: OrderStatus.IN_PROCESS,
        });

        await useCase.execute(
            { id: 'order-1' } as never,
            OrderStatus.CANCELED,
            user,
        );

        expect(cancellationRepository.create).not.toHaveBeenCalled();
    });
});
