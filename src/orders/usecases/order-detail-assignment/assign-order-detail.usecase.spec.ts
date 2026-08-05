import { BadRequestException } from '@nestjs/common';
import { AssignOrderDetailUseCase } from './assign-order-detail.usecase';
import { UserRoles } from '../../../users/enums/user-role';
import { OrderStatus } from '../../enums/order-status.enum';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
  const userRepository = { findOne: jest.fn() };
  const orderDetailRepository = { findOne: jest.fn() };
  const orderDetailAssignmentRepository = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };

  const useCase = new AssignOrderDetailUseCase(
    userRepository as never,
    orderDetailRepository as never,
    orderDetailAssignmentRepository as never,
  );

  return {
    useCase,
    userRepository,
    orderDetailRepository,
    orderDetailAssignmentRepository,
  };
}

const user = { id: 'user-1' } as User;
const branch = { id: 'branch-1' };
const baker = {
  id: 'baker-1',
  role: UserRoles.BAKER,
  branches: [branch],
};
const orderDetail = {
  id: 'detail-1',
  order: { id: 'order-1', status: OrderStatus.CREATED, branch },
};

describe('AssignOrderDetailUseCase', () => {
  it('lanza BadRequestException si el detalle no existe', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute('detail-1', { bakerId: 'baker-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el pedido está DELIVERED', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue({
      ...orderDetail,
      order: { ...orderDetail.order, status: OrderStatus.DELIVERED },
    });

    await expect(
      mocks.useCase.execute('detail-1', { bakerId: 'baker-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el pedido está CANCELED', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue({
      ...orderDetail,
      order: { ...orderDetail.order, status: OrderStatus.CANCELED },
    });

    await expect(
      mocks.useCase.execute('detail-1', { bakerId: 'baker-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el repostero no existe', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(orderDetail);
    mocks.userRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute('detail-1', { bakerId: 'baker-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el repostero no pertenece a la sucursal del pedido', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(orderDetail);
    mocks.userRepository.findOne.mockResolvedValue({
      ...baker,
      branches: [{ id: 'branch-2' }],
    });

    await expect(
      mocks.useCase.execute('detail-1', { bakerId: 'baker-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('crea la asignación cuando la línea no tiene una', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(orderDetail);
    mocks.userRepository.findOne.mockResolvedValue(baker);
    mocks.orderDetailAssignmentRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(
      'detail-1',
      { bakerId: 'baker-1', notes: 'Urgente' } as never,
      user,
    );

    expect(mocks.orderDetailAssignmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baker,
        orderDetail,
        notes: 'Urgente',
        createdBy: user,
        updatedBy: user,
      }),
    );
  });

  it('actualiza la asignación existente en vez de crear una nueva (reasignar)', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(orderDetail);
    mocks.userRepository.findOne.mockResolvedValue(baker);
    const existingAssignment = {
      id: 'assignment-1',
      baker: { id: 'baker-old' },
    };
    mocks.orderDetailAssignmentRepository.findOne.mockResolvedValue(
      existingAssignment,
    );

    await mocks.useCase.execute(
      'detail-1',
      { bakerId: 'baker-1' } as never,
      user,
    );

    expect(mocks.orderDetailAssignmentRepository.create).not.toHaveBeenCalled();
    expect(mocks.orderDetailAssignmentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'assignment-1',
        baker,
        updatedBy: user,
      }),
    );
  });

  it('usa la fecha actual como assignedDate por defecto si no se provee', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(orderDetail);
    mocks.userRepository.findOne.mockResolvedValue(baker);
    mocks.orderDetailAssignmentRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(
      'detail-1',
      { bakerId: 'baker-1' } as never,
      user,
    );

    const created =
      mocks.orderDetailAssignmentRepository.create.mock.calls[0][0];
    expect(created.assignedDate).toBeInstanceOf(Date);
  });
});
