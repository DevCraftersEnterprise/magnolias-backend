import { BadRequestException } from '@nestjs/common';
import { UpdateAssignOrderUseCase } from './update-assign-order.usecase';
import { OrderStatus } from '../../enums/order-status.enum';
import { UserRoles } from '../../../users/enums/user-role';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const userRepository = { findOne: jest.fn() };
    const orderAssignmentRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new UpdateAssignOrderUseCase(
        userRepository as never,
        orderAssignmentRepository as never,
    );

    return { useCase, userRepository, orderAssignmentRepository };
}

const user = { id: 'user-1' } as User;
const branch = { id: 'branch-1' };

function baseAssignment(overrides: Record<string, unknown> = {}) {
    return {
        id: 'assignment-1',
        baker: { id: 'baker-old' },
        order: { id: 'order-1', status: OrderStatus.CREATED, branch },
        notes: 'nota vieja',
        ...overrides,
    };
}

describe('UpdateAssignOrderUseCase', () => {
    it('lanza BadRequestException si el nuevo repostero no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('baker-new', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si no existe la asignación', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'baker-new',
            role: UserRoles.BAKER,
            branches: [branch],
        });
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('baker-new', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el pedido no está en CREATED', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'baker-new',
            role: UserRoles.BAKER,
            branches: [branch],
        });
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(
            baseAssignment({
                order: { id: 'order-1', status: OrderStatus.DONE, branch },
            }),
        );

        await expect(
            mocks.useCase.execute('baker-new', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si ya está asignado a ese mismo repostero', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'baker-old',
            role: UserRoles.BAKER,
            branches: [branch],
        });
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(
            baseAssignment({ baker: { id: 'baker-old' } }),
        );

        await expect(
            mocks.useCase.execute('baker-old', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el repostero no pertenece a la sucursal del pedido', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'baker-new',
            role: UserRoles.BAKER,
            branches: [{ id: 'otra-sucursal' }],
        });
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(baseAssignment());

        await expect(
            mocks.useCase.execute('baker-new', { orderId: 'order-1' } as never, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('reasigna el pedido a un nuevo repostero con acceso a la sucursal', async () => {
        const mocks = createMocks();
        const newBaker = {
            id: 'baker-new',
            role: UserRoles.BAKER,
            branches: [branch],
        };
        mocks.userRepository.findOne.mockResolvedValue(newBaker);
        const assignment = baseAssignment();
        mocks.orderAssignmentRepository.findOne.mockResolvedValue(assignment);

        const result = await mocks.useCase.execute(
            'baker-new',
            { orderId: 'order-1', notes: 'nota nueva' } as never,
            user,
        );

        expect(result.baker).toEqual(newBaker);
        expect(result.notes).toBe('nota nueva');
        expect(result.updatedBy).toBe(user);
    });
});
