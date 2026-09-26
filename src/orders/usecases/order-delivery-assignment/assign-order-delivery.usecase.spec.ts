import { BadRequestException } from '@nestjs/common';
import { AssignOrderDeliveryUseCase } from './assign-order-delivery.usecase';
import { UserRoles } from '../../../users/enums/user-role';
import { OrderStatus } from '../../enums/order-status.enum';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
  const userRepository = { findOne: jest.fn() };
  const orderRepository = { findOne: jest.fn() };
  const orderDeliveryAssignmentRepository = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };

  const useCase = new AssignOrderDeliveryUseCase(
    userRepository as never,
    orderRepository as never,
    orderDeliveryAssignmentRepository as never,
  );

  return {
    useCase,
    userRepository,
    orderRepository,
    orderDeliveryAssignmentRepository,
  };
}

const user = { id: 'user-1' } as User;
const branch = { id: 'branch-1' };
const driver = {
  id: 'driver-1',
  role: UserRoles.DRIVER,
  branches: [branch],
};
const order = {
  id: 'order-1',
  status: OrderStatus.DONE,
  branch,
};

describe('AssignOrderDeliveryUseCase', () => {
  it('lanza BadRequestException si el pedido no existe', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute('order-1', { driverId: 'driver-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el pedido está DELIVERED', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue({
      ...order,
      status: OrderStatus.DELIVERED,
    });

    await expect(
      mocks.useCase.execute('order-1', { driverId: 'driver-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el pedido está CANCELED', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue({
      ...order,
      status: OrderStatus.CANCELED,
    });

    await expect(
      mocks.useCase.execute('order-1', { driverId: 'driver-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el repartidor no existe', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue(order);
    mocks.userRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute('order-1', { driverId: 'driver-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el repartidor no pertenece a la sucursal del pedido', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue(order);
    mocks.userRepository.findOne.mockResolvedValue({
      ...driver,
      branches: [{ id: 'branch-2' }],
    });

    await expect(
      mocks.useCase.execute('order-1', { driverId: 'driver-1' } as never, user),
    ).rejects.toThrow(BadRequestException);
  });

  it('crea la asignación cuando el pedido no tiene una', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue(order);
    mocks.userRepository.findOne.mockResolvedValue(driver);
    mocks.orderDeliveryAssignmentRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(
      'order-1',
      { driverId: 'driver-1', notes: 'Urgente' } as never,
      user,
    );

    expect(
      mocks.orderDeliveryAssignmentRepository.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        driver,
        order,
        notes: 'Urgente',
        createdBy: user,
        updatedBy: user,
      }),
    );
  });

  it('actualiza la asignación existente en vez de crear una nueva (reasignar)', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue(order);
    mocks.userRepository.findOne.mockResolvedValue(driver);
    const existingAssignment = {
      id: 'assignment-1',
      driver: { id: 'driver-old' },
    };
    mocks.orderDeliveryAssignmentRepository.findOne.mockResolvedValue(
      existingAssignment,
    );

    await mocks.useCase.execute(
      'order-1',
      { driverId: 'driver-1' } as never,
      user,
    );

    expect(
      mocks.orderDeliveryAssignmentRepository.create,
    ).not.toHaveBeenCalled();
    expect(mocks.orderDeliveryAssignmentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'assignment-1',
        driver,
        updatedBy: user,
      }),
    );
  });

  it('usa la fecha actual como assignedDate por defecto si no se provee', async () => {
    const mocks = createMocks();
    mocks.orderRepository.findOne.mockResolvedValue(order);
    mocks.userRepository.findOne.mockResolvedValue(driver);
    mocks.orderDeliveryAssignmentRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(
      'order-1',
      { driverId: 'driver-1' } as never,
      user,
    );

    const created =
      mocks.orderDeliveryAssignmentRepository.create.mock.calls[0][0];
    expect(created.assignedDate).toBeInstanceOf(Date);
  });
});
