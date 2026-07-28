import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveFlowerUseCase } from './remove-flower.usecase';
import type { User } from '../../users/entities/user.entity';

describe('RemoveFlowerUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: RemoveFlowerUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new RemoveFlowerUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si la flor no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(useCase.execute('flower-1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza BadRequestException si ya estaba inactiva', async () => {
    findOneMock.mockResolvedValue({ id: 'flower-1', isActive: false });

    await expect(useCase.execute('flower-1', user)).rejects.toThrow(
      BadRequestException,
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('marca la flor como inactiva (soft delete)', async () => {
    findOneMock.mockResolvedValue({ id: 'flower-1', isActive: true });

    await useCase.execute('flower-1', user);

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false, updatedBy: user }),
    );
  });
});
