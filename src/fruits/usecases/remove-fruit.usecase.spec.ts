import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveFruitUseCase } from './remove-fruit.usecase';
import type { User } from '../../users/entities/user.entity';

describe('RemoveFruitUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: RemoveFruitUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new RemoveFruitUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si la fruta no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(useCase.execute('fruit-1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza BadRequestException si ya estaba inactiva', async () => {
    findOneMock.mockResolvedValue({ id: 'fruit-1', isActive: false });

    await expect(useCase.execute('fruit-1', user)).rejects.toThrow(
      BadRequestException,
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('marca la fruta como inactiva (soft delete)', async () => {
    findOneMock.mockResolvedValue({ id: 'fruit-1', isActive: true });

    await useCase.execute('fruit-1', user);

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false, updatedBy: user }),
    );
  });
});
