import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ClaimOrderDeliveryUseCase } from './claim-order-delivery.usecase';
import { OrderStatus } from '../../enums/order-status.enum';

function createQueryBuilderMock(order: unknown) {
  return {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(order),
  };
}

function createMocks(order: unknown) {
  const orderDeliveryAssignmentRepository = {
    findOne: jest.fn(),
    create: jest.fn((data: unknown) => data),
    save: jest.fn((data: unknown) => Promise.resolve(data)),
  };
  const orderRepository = {
    update: jest.fn().mockResolvedValue(undefined),
  };
  const queryBuilder = createQueryBuilderMock(order);

  const manager = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    getRepository: jest.fn((entity: { name: string }) =>
      entity.name === 'Order'
        ? orderRepository
        : orderDeliveryAssignmentRepository,
    ),
  };

  const dataSource = {
    transaction: jest.fn((cb: (manager: unknown) => unknown) => cb(manager)),
  };

  const useCase = new ClaimOrderDeliveryUseCase(dataSource as never);

  return {
    useCase,
    dataSource,
    manager,
    queryBuilder,
    orderRepository,
    orderDeliveryAssignmentRepository,
  };
}

describe('ClaimOrderDeliveryUseCase', () => {
  it('lanza NotFoundException si el pedido no existe', async () => {
    const mocks = createMocks(null);

    await expect(
      mocks.useCase.execute('order-1', {}, { id: 'driver-1' } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza BadRequestException si el pedido no está DONE', async () => {
    const order = {
      id: 'order-1',
      status: OrderStatus.IN_PROCESS,
      branch: { id: 'branch-1' },
    };
    const mocks = createMocks(order);

    await expect(
      mocks.useCase.execute('order-1', {}, { id: 'driver-1' } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el repartidor no pertenece a la sucursal del pedido', async () => {
    const order = {
      id: 'order-1',
      status: OrderStatus.DONE,
      branch: { id: 'branch-1' },
    };
    const mocks = createMocks(order);
    const driver = { id: 'driver-1', branches: [{ id: 'branch-2' }] };

    await expect(
      mocks.useCase.execute('order-1', {}, driver as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza ConflictException si el pedido ya fue tomado por otro repartidor', async () => {
    const order = {
      id: 'order-1',
      status: OrderStatus.DONE,
      branch: { id: 'branch-1' },
    };
    const mocks = createMocks(order);
    mocks.orderDeliveryAssignmentRepository.findOne.mockResolvedValue({
      id: 'assignment-1',
    });
    const driver = { id: 'driver-1', branches: [{ id: 'branch-1' }] };

    await expect(
      mocks.useCase.execute('order-1', {}, driver as never),
    ).rejects.toThrow(ConflictException);
  });

  it('crea la asignación y mueve el pedido a IN_DELIVERY cuando todo es válido', async () => {
    const order = {
      id: 'order-1',
      status: OrderStatus.DONE,
      branch: { id: 'branch-1' },
    };
    const mocks = createMocks(order);
    mocks.orderDeliveryAssignmentRepository.findOne.mockResolvedValue(null);
    const driver = { id: 'driver-1', branches: [{ id: 'branch-1' }] };

    const result = await mocks.useCase.execute(
      'order-1',
      { notes: 'Salgo ya' },
      driver as never,
    );

    expect(result).toMatchObject({
      driver,
      order,
      notes: 'Salgo ya',
      createdBy: driver,
      updatedBy: driver,
    });
    expect(mocks.orderRepository.update).toHaveBeenCalledWith('order-1', {
      status: OrderStatus.IN_DELIVERY,
      updatedBy: driver,
    });
  });
});
