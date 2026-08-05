import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateProductionStatusUseCase } from './update-production-status.usecase';
import { UserRoles } from '../../../users/enums/user-role';
import { OrderStatus } from '../../enums/order-status.enum';
import { OrderDetailProductionStatus } from '../../enums/order-detail-production-status.enum';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
  const orderDetailRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };
  const orderRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };
  const userRepository = { findOne: jest.fn() };

  const useCase = new UpdateProductionStatusUseCase(
    orderDetailRepository as never,
    orderRepository as never,
    userRepository as never,
  );

  return { useCase, orderDetailRepository, orderRepository, userRepository };
}

const branch = { id: 'branch-1' };
const superUser = { id: 'super-1', role: UserRoles.SUPER } as User;
const employeeUser = { id: 'employee-1', role: UserRoles.EMPLOYEE } as User;
const assignedBaker = { id: 'baker-1', role: UserRoles.BAKER } as User;
const otherBaker = { id: 'baker-2', role: UserRoles.BAKER } as User;

function baseDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: 'detail-1',
    productionStatus: OrderDetailProductionStatus.PENDING,
    order: {
      id: 'order-1',
      status: OrderStatus.CREATED,
      branch,
      details: [{ productionStatus: OrderDetailProductionStatus.PENDING }],
    },
    assignments: [{ baker: assignedBaker }],
    ...overrides,
  };
}

describe('UpdateProductionStatusUseCase', () => {
  it('lanza BadRequestException si el detalle no existe', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        superUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza BadRequestException si el pedido está DELIVERED', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(
      baseDetail({ order: { ...baseDetail().order, status: OrderStatus.DELIVERED } }),
    );

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        superUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('permite a SUPER/ADMIN avanzar sin importar la asignación', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(baseDetail());
    mocks.orderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CREATED,
      details: [{ productionStatus: OrderDetailProductionStatus.IN_PROCESS }],
    });

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        superUser,
      ),
    ).resolves.toBeDefined();
  });

  it('rechaza a EMPLOYEE (no puede avanzar producción)', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(baseDetail());

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        employeeUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite al repostero asignado avanzar su propia línea', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(baseDetail());
    mocks.orderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CREATED,
      details: [{ productionStatus: OrderDetailProductionStatus.IN_PROCESS }],
    });

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        assignedBaker,
      ),
    ).resolves.toBeDefined();
  });

  it('rechaza a un repostero distinto del asignado', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(baseDetail());

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        otherBaker,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite a cualquier repostero de la sucursal tomar una línea sin asignar', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(
      baseDetail({ assignments: [] }),
    );
    mocks.userRepository.findOne.mockResolvedValue({
      ...otherBaker,
      branches: [branch],
    });
    mocks.orderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CREATED,
      details: [{ productionStatus: OrderDetailProductionStatus.IN_PROCESS }],
    });

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        otherBaker,
      ),
    ).resolves.toBeDefined();
  });

  it('rechaza a un repostero de otra sucursal en una línea sin asignar', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(
      baseDetail({ assignments: [] }),
    );
    mocks.userRepository.findOne.mockResolvedValue({
      ...otherBaker,
      branches: [{ id: 'branch-2' }],
    });

    await expect(
      mocks.useCase.execute(
        'detail-1',
        { status: OrderDetailProductionStatus.IN_PROCESS } as never,
        otherBaker,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('recalcula y persiste el estado derivado del pedido cuando cambia', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(baseDetail());
    mocks.orderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CREATED,
      details: [{ productionStatus: OrderDetailProductionStatus.IN_PROCESS }],
    });

    await mocks.useCase.execute(
      'detail-1',
      { status: OrderDetailProductionStatus.IN_PROCESS } as never,
      assignedBaker,
    );

    expect(mocks.orderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderStatus.IN_PROCESS }),
    );
  });

  it('no re-guarda el pedido si el estado derivado no cambia', async () => {
    const mocks = createMocks();
    mocks.orderDetailRepository.findOne.mockResolvedValue(baseDetail());
    mocks.orderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.IN_PROCESS,
      details: [{ productionStatus: OrderDetailProductionStatus.IN_PROCESS }],
    });

    await mocks.useCase.execute(
      'detail-1',
      { status: OrderDetailProductionStatus.IN_PROCESS } as never,
      assignedBaker,
    );

    expect(mocks.orderRepository.save).not.toHaveBeenCalled();
  });
});
