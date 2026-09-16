import { BadRequestException } from '@nestjs/common';
import { GetAvailableDeliveriesUseCase } from './get-available-deliveries.usecase';

function createMocks(orders: unknown[] = []) {
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(orders),
  };
  const orderRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };

  const useCase = new GetAvailableDeliveriesUseCase(orderRepository as never);

  return { useCase, orderRepository, queryBuilder };
}

describe('GetAvailableDeliveriesUseCase', () => {
  it('lanza BadRequestException si el repartidor no tiene sucursal asociada', async () => {
    const mocks = createMocks();

    await expect(
      mocks.useCase.execute({ id: 'driver-1', branches: [] } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('filtra por status DONE, la sucursal del repartidor y sin asignación', async () => {
    const orders = [{ id: 'order-1' }];
    const mocks = createMocks(orders);
    const driver = { id: 'driver-1', branches: [{ id: 'branch-1' }, { id: 'branch-2' }] };

    const result = await mocks.useCase.execute(driver as never);

    expect(result).toBe(orders);
    expect(mocks.queryBuilder.where).toHaveBeenCalledWith(
      'order.status = :status',
      { status: 'DONE' },
    );
    expect(mocks.queryBuilder.andWhere).toHaveBeenCalledWith(
      'branch.id IN (:...branchIds)',
      { branchIds: ['branch-1', 'branch-2'] },
    );
    expect(mocks.queryBuilder.andWhere).toHaveBeenCalledWith(
      'deliveryAssignment.id IS NULL',
    );
  });
});
