import { BadRequestException } from '@nestjs/common';
import { GetBakerDetailAssignmentsUseCase } from './get-baker-detail-assignments.usecase';

function createMocks() {
  const userRepository = { findOne: jest.fn() };
  const orderDetailAssignmentRepository = { find: jest.fn() };

  const useCase = new GetBakerDetailAssignmentsUseCase(
    userRepository as never,
    orderDetailAssignmentRepository as never,
  );

  return { useCase, userRepository, orderDetailAssignmentRepository };
}

describe('GetBakerDetailAssignmentsUseCase', () => {
  it('lanza BadRequestException si el repostero no existe', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue(null);

    await expect(mocks.useCase.execute('baker-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('devuelve las asignaciones por línea del repostero', async () => {
    const mocks = createMocks();
    mocks.userRepository.findOne.mockResolvedValue({ id: 'baker-1' });
    const assignments = [{ id: 'assignment-1' }, { id: 'assignment-2' }];
    mocks.orderDetailAssignmentRepository.find.mockResolvedValue(assignments);

    const result = await mocks.useCase.execute('baker-1');

    expect(result).toBe(assignments);
    expect(mocks.orderDetailAssignmentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          baker: { id: 'baker-1' },
        }),
      }),
    );
  });
});
