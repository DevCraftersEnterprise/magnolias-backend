import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateFillingUseCase } from './update-filling.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateFillingUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: UpdateFillingUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new UpdateFillingUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si el relleno no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      useCase.execute('filling-1', { name: 'fresa' }, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el nuevo nombre ya pertenece a otro relleno', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'filling-1', name: 'NUTELLA' })
      .mockResolvedValueOnce({ id: 'filling-2', name: 'FRESA' });

    await expect(
      useCase.execute('filling-1', { name: 'fresa' }, user),
    ).rejects.toThrow(ConflictException);
  });

  it('actualiza el relleno normalizando el nombre a mayúsculas', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'filling-1', name: 'NUTELLA' })
      .mockResolvedValueOnce(null);

    const result = await useCase.execute(
      'filling-1',
      { name: 'fresa' },
      user,
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'filling-1',
        name: 'FRESA',
        updatedBy: user,
      }),
    );
  });
});
