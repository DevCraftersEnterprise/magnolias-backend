import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveFrostingUseCase } from './remove-frosting.usecase';
import type { User } from '../../users/entities/user.entity';

describe('RemoveFrostingUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: RemoveFrostingUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new RemoveFrostingUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si el betún no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(useCase.execute('frosting-1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza BadRequestException si ya estaba inactivo', async () => {
    findOneMock.mockResolvedValue({ id: 'frosting-1', isActive: false });

    await expect(useCase.execute('frosting-1', user)).rejects.toThrow(
      BadRequestException,
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('marca el betún como inactivo (soft delete)', async () => {
    findOneMock.mockResolvedValue({ id: 'frosting-1', isActive: true });

    await useCase.execute('frosting-1', user);

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false, updatedBy: user }),
    );
  });
});
