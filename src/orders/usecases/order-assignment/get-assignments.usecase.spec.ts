import { BadRequestException } from '@nestjs/common';
import { GetAssignmentsUseCase } from './get-assignments.usecase';
import { OrderStatus } from '../../../orders/enums/order-status.enum';

function createMocks() {
  const userRepository = { findOne: jest.fn() };
  const orderAssignmentRepository = { find: jest.fn() };

  const useCase = new GetAssignmentsUseCase(
    userRepository as never,
    orderAssignmentRepository as never,
  );

  return { useCase, userRepository, orderAssignmentRepository };
}

describe('GetAssignmentsUseCase', () => {
  it('lanza BadRequestException si el repostero no existe', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue(null);

    await expect(mocks.useCase.execute('baker-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('retorna las asignaciones del repostero', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue({ id: 'baker-1' });
    const assignments = [{ id: 'assignment-1' }];
    mocks.orderAssignmentRepository.find.mockResolvedValue(assignments);

    const result = await mocks.useCase.execute('baker-1');

    expect(result).toBe(assignments);
  });

  it('REGRESIÓN (documenta un bug existente): el filtro de status colapsa siempre a CREATED por el uso de "||" en vez de una lista', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue({ id: 'baker-1' });
    mocks.orderAssignmentRepository.find.mockResolvedValue([]);

    await mocks.useCase.execute('baker-1');

    const callArgs = mocks.orderAssignmentRepository.find.mock.calls[0][0];
    // Este test documenta el comportamiento ACTUAL (probablemente no intencional):
    // "CREATED || IN_PROCESS || DONE" siempre se evalúa a "CREATED".
    expect(callArgs.where.order.status).toBe(OrderStatus.CREATED);
  });
});
