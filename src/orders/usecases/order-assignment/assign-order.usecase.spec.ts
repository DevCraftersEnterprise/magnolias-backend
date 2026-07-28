import { BadRequestException } from '@nestjs/common';
import { AssignOrderUseCase } from './assign-order.usecase';
import { UserRoles } from '../../../users/enums/user-role';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const userRepository = { findOne: jest.fn() };
    const orderRepository = { findOne: jest.fn() };
    const orderAssignmentRepository = {
        findOne: jest.fn(),
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new AssignOrderUseCase(
        userRepository as never,
        orderRepository as never,
        orderAssignmentRepository as never,
    );

    return { useCase, userRepository, orderRepository, orderAssignmentRepository };
}

const user = { id: 'user-1' } as User;
const baker = { id: 'baker-1', role: UserRoles.BAKER };
const order = { id: 'order-1' };

describe('AssignOrderUseCase', () => {
    it('lanza BadRequestException si el repostero no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('baker-1', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el pedido no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baker);
        mocks.orderRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('baker-1', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el pedido ya está asignado', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baker);
        mocks.orderRepository.findOne.mockResolvedValue(order);
        mocks.orderAssignmentRepository.findOne.mockResolvedValue({
            id: 'assignment-1',
        });

        await expect(
            mocks.useCase.execute('baker-1', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('crea la asignación con los datos correctos', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baker);
        mocks.orderRepository.findOne.mockResolvedValue(order);
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(null);

        await mocks.useCase.execute(
            'baker-1',
            { orderId: 'order-1', notes: 'Urgente' } as never,
            user,
        );

        expect(mocks.orderAssignmentRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                baker,
                order,
                notes: 'Urgente',
                createdBy: user,
                updatedBy: user,
            }),
        );
    });

    it('usa la fecha actual como assignedDate por defecto si no se provee', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baker);
        mocks.orderRepository.findOne.mockResolvedValue(order);
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(null);

        await mocks.useCase.execute('baker-1', { orderId: 'order-1' } as never, user);

        const created = mocks.orderAssignmentRepository.create.mock.calls[0][0];
        expect(created.assignedDate).toBeInstanceOf(Date);
    });
});
