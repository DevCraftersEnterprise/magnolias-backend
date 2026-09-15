import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateFruitUseCase } from './update-fruit.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateFruitUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: UpdateFruitUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new UpdateFruitUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si la fruta no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      useCase.execute('fruit-1', { name: 'mango' }, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el nuevo nombre ya pertenece a otra fruta', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'fruit-1', name: 'FRESA' })
      .mockResolvedValueOnce({ id: 'fruit-2', name: 'MANGO' });

    await expect(
      useCase.execute('fruit-1', { name: 'mango' }, user),
    ).rejects.toThrow(ConflictException);
  });

  it('actualiza la fruta normalizando el nombre a mayúsculas', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'fruit-1', name: 'FRESA' })
      .mockResolvedValueOnce(null);

    const result = await useCase.execute('fruit-1', { name: 'mango' }, user);

    expect(result).toEqual(
      expect.objectContaining({
        id: 'fruit-1',
        name: 'MANGO',
        updatedBy: user,
      }),
    );
  });
});
