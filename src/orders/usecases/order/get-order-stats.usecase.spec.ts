import { BadRequestException } from '@nestjs/common';
import { GetOrderStatsUseCase } from './get-order-stats.usecase';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
  const orderRepository = {
    findAndCount: jest.fn(),
  };

  const useCase = new GetOrderStatsUseCase(orderRepository as never);

  return { useCase, orderRepository };
}

function order(overrides: Record<string, unknown> = {}) {
  return {
    status: 'CREATED',
    isEvento: false,
    isEnTienda: false,
    includesFlowers: false,
    ...overrides,
  };
}

describe('GetOrderStatsUseCase', () => {
  it('lanza BadRequestException si un usuario no ADMIN/SUPER no tiene sucursal asociada', async () => {
    const { useCase } = createMocks();
    const user = { id: 'user-1', role: 'BAKER', branch: {} } as User;

    await expect(useCase.execute(user)).rejects.toThrow(BadRequestException);
  });

  it('filtra por la sucursal del usuario cuando no es ADMIN/SUPER', async () => {
    const { useCase, orderRepository } = createMocks();
    orderRepository.findAndCount.mockResolvedValue([[], 0]);
    const user = { id: 'user-1', role: 'BAKER', branch: { id: 'branch-1' } } as User;

    await useCase.execute(user);

    expect(orderRepository.findAndCount).toHaveBeenCalledWith({
      where: { branch: { id: 'branch-1' } },
    });
  });

  it('ADMIN/SUPER sin branchId consulta todas las sucursales', async () => {
    const { useCase, orderRepository } = createMocks();
    orderRepository.findAndCount.mockResolvedValue([[], 0]);
    const user = { id: 'admin-1', role: 'ADMIN' } as User;

    await useCase.execute(user);

    expect(orderRepository.findAndCount).toHaveBeenCalledWith({ where: {} });
  });

  it('ADMIN/SUPER con branchId filtra por esa sucursal', async () => {
    const { useCase, orderRepository } = createMocks();
    orderRepository.findAndCount.mockResolvedValue([[], 0]);
    const user = { id: 'admin-1', role: 'SUPER' } as User;

    await useCase.execute(user, 'branch-2');

    expect(orderRepository.findAndCount).toHaveBeenCalledWith({
      where: { branch: { id: 'branch-2' } },
    });
  });

  it('calcula los conteos por estado y por tipo, con conFlores como bucket no exclusivo', async () => {
    const { useCase, orderRepository } = createMocks();
    const orders = [
      order({ status: 'CREATED' }), // domicilio puro
      order({ status: 'IN PROCESS', isEnTienda: true }),
      order({ status: 'DONE', isEvento: true, includesFlowers: true }),
      order({ status: 'DELIVERED', includesFlowers: true }), // domicilio + flores
      order({ status: 'CANCELED' }),
    ];
    orderRepository.findAndCount.mockResolvedValue([orders, orders.length]);
    const user = { id: 'admin-1', role: 'ADMIN' } as User;

    const stats = await useCase.execute(user);

    expect(stats.total).toBe(5);
    expect(stats.data.created).toBe(1);
    expect(stats.data.in_process).toBe(1);
    expect(stats.data.done).toBe(1);
    expect(stats.data.delivered).toBe(1);
    expect(stats.data.cancelled).toBe(1);
    expect(stats.data.order_type_counts).toEqual({
      domicilio: 3,
      evento: 1,
      enTienda: 1,
      conFlores: 2,
    });
  });
});
