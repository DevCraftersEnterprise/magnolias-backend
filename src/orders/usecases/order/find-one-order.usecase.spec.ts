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
            expect.objectContaining({ where: { id: 'order-1' } }),
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
});
