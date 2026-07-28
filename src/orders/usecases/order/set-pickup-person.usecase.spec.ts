import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SetPickupPersonUseCase } from './set-pickup-person.usecase';
import type { User } from '../../../users/entities/user.entity';

describe('SetPickupPersonUseCase', () => {
    function createMocks() {
        const orderRepository = {
            findOne: jest.fn(),
            save: jest.fn((entity) => Promise.resolve(entity)),
        };
        const useCase = new SetPickupPersonUseCase(orderRepository as never);
        return { useCase, orderRepository };
    }

    const user = { id: 'user-1' } as User;

    it('lanza NotFoundException si el pedido no existe', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue(null);

        await expect(
            useCase.execute(
                'order-1',
                { pickupPersonName: 'Ana', pickupPersonPhone: '555' } as never,
                user,
            ),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el pedido no tiene dirección de entrega', async () => {
        const { useCase, orderRepository } = createMocks();
        orderRepository.findOne.mockResolvedValue({
            id: 'order-1',
            deliveryAddress: null,
        });

        await expect(
            useCase.execute(
                'order-1',
                { pickupPersonName: 'Ana', pickupPersonPhone: '555' } as never,
                user,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('actualiza el nombre y teléfono de quien recoge', async () => {
        const { useCase, orderRepository } = createMocks();
        const order = {
            id: 'order-1',
            deliveryAddress: { receiverName: 'Anterior', receiverPhone: '000' },
        };
        orderRepository.findOne.mockResolvedValue(order);

        const result = await useCase.execute(
            'order-1',
            { pickupPersonName: 'Ana', pickupPersonPhone: '5555555555' } as never,
            user,
        );

        expect(result.deliveryAddress?.receiverName).toBe('Ana');
        expect(result.deliveryAddress?.receiverPhone).toBe('5555555555');
        expect(orderRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ updatedBy: user }),
        );
    });
});
