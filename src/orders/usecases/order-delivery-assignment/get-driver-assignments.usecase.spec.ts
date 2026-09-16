import { BadRequestException } from '@nestjs/common';
import { In } from 'typeorm';
import { GetDriverAssignmentsUseCase } from './get-driver-assignments.usecase';
import { OrderStatus } from '../../enums/order-status.enum';

function createMocks() {
  const userRepository = { findOne: jest.fn() };
  const orderDeliveryAssignmentRepository = { find: jest.fn() };

  const useCase = new GetDriverAssignmentsUseCase(
    userRepository as never,
    orderDeliveryAssignmentRepository as never,
  );

  return { useCase, userRepository, orderDeliveryAssignmentRepository };
}

describe('GetDriverAssignmentsUseCase', () => {
  it('lanza BadRequestException si el repartidor no existe', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue(null);

    await expect(mocks.useCase.execute('driver-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('devuelve las entregas asignadas al repartidor', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue({ id: 'driver-1' });
    const assignments = [{ id: 'assignment-1' }, { id: 'assignment-2' }];
    mocks.orderDeliveryAssignmentRepository.find.mockResolvedValue(
      assignments,
    );

    const result = await mocks.useCase.execute('driver-1');

    expect(result).toBe(assignments);
    expect(
      mocks.orderDeliveryAssignmentRepository.find,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          driver: { id: 'driver-1' },
        }),
      }),
    );
  });

  it('incluye IN_DELIVERY en los estados consultados (cliente: sigue viendo el pedido tras tomarlo)', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue({ id: 'driver-1' });
    mocks.orderDeliveryAssignmentRepository.find.mockResolvedValue([]);

    await mocks.useCase.execute('driver-1');

    expect(
      mocks.orderDeliveryAssignmentRepository.find,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          order: expect.objectContaining({
            status: In([
              OrderStatus.CREATED,
              OrderStatus.IN_PROCESS,
              OrderStatus.DONE,
              OrderStatus.IN_DELIVERY,
            ]),
          }),
        }),
      }),
    );
  });

  it('incluye la dirección de entrega en las relaciones (cliente: repartidor debe ver la dirección)', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue({ id: 'driver-1' });
    mocks.orderDeliveryAssignmentRepository.find.mockResolvedValue([]);

    await mocks.useCase.execute('driver-1');

    expect(
      mocks.orderDeliveryAssignmentRepository.find,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: expect.objectContaining({
          order: expect.objectContaining({
            deliveryAddress: true,
          }),
        }),
      }),
    );
  });
});
