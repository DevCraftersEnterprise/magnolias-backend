import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateFlowerUseCase } from './update-flower.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateFlowerUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: UpdateFlowerUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new UpdateFlowerUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si la flor no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      useCase.execute('flower-1', { name: 'tulipán' }, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el nuevo nombre ya pertenece a otra flor', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'flower-1', name: 'ROSA' })
      .mockResolvedValueOnce({ id: 'flower-2', name: 'TULIPÁN' });

    await expect(
      useCase.execute('flower-1', { name: 'tulipán' }, user),
    ).rejects.toThrow(ConflictException);
  });

  it('actualiza la flor normalizando el nombre a mayúsculas', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'flower-1', name: 'ROSA' })
      .mockResolvedValueOnce(null);

    const result = await useCase.execute(
      'flower-1',
      { name: 'tulipán' },
      user,
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'flower-1',
        name: 'TULIPÁN',
        updatedBy: user,
      }),
    );
  });
});
