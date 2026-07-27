import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateFrostingUseCase } from './update-frosting.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateFrostingUseCase', () => {
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: UpdateFrostingUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn((entity) => Promise.resolve(entity));
    useCase = new UpdateFrostingUseCase({
      findOne: findOneMock,
      save: saveMock,
    } as never);
  });

  it('lanza NotFoundException si el betún no existe', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      useCase.execute('frosting-1', { name: 'chantilly' }, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el nuevo nombre ya pertenece a otro betún', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'frosting-1', name: 'MERENGUE' })
      .mockResolvedValueOnce({ id: 'frosting-2', name: 'CHANTILLY' });

    await expect(
      useCase.execute('frosting-1', { name: 'chantilly' }, user),
    ).rejects.toThrow(ConflictException);
  });

  it('actualiza el betún normalizando el nombre a mayúsculas', async () => {
    findOneMock
      .mockResolvedValueOnce({ id: 'frosting-1', name: 'MERENGUE' })
      .mockResolvedValueOnce(null);

    const result = await useCase.execute(
      'frosting-1',
      { name: 'chantilly' },
      user,
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'frosting-1',
        name: 'CHANTILLY',
        updatedBy: user,
      }),
    );
  });
});
