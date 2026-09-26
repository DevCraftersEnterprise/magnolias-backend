import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateDecorationUseCase } from './update-decoration.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateDecorationUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: UpdateDecorationUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new UpdateDecorationUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si la decoración no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      useCase.execute('decoration-1', { name: 'chispas' }, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el nuevo nombre ya pertenece a otra decoración', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'decoration-1', name: 'PERLAS DORADAS' })
      .mockResolvedValueOnce({ id: 'decoration-2', name: 'CHISPAS' });

    await expect(
      useCase.execute('decoration-1', { name: 'chispas' }, user),
    ).rejects.toThrow(ConflictException);
  });

  it('actualiza la decoración normalizando el nombre a mayúsculas', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'decoration-1', name: 'PERLAS DORADAS' })
      .mockResolvedValueOnce(null);

    const result = await useCase.execute(
      'decoration-1',
      { name: 'chispas' },
      user,
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'decoration-1',
        name: 'CHISPAS',
        updatedBy: user,
      }),
    );
  });
});
