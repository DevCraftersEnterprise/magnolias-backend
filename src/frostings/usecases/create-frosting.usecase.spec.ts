import { ConflictException } from '@nestjs/common';
import { CreateFrostingUseCase } from './create-frosting.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateFrostingUseCase', () => {
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: CreateFrostingUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    createMock = jest.fn((data) => data);
    saveMock = jest.fn((entity) =>
      Promise.resolve({ ...entity, id: 'frosting-1' }),
    );

    useCase = new CreateFrostingUseCase({
      findOne: findOneMock,
      create: createMock,
      save: saveMock,
    } as never);
  });

  it('crea un betún nuevo normalizando el nombre a mayúsculas', async () => {
    findOneMock.mockResolvedValue(null);

    const result = await useCase.execute(
      { name: 'merengue', description: 'rico' },
      user,
    );

    expect(findOneMock).toHaveBeenCalledWith({
      where: { name: 'MERENGUE' },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'MERENGUE',
        createdBy: user,
        updatedBy: user,
      }),
    );
    expect(result.id).toBe('frosting-1');
  });

  it('lanza ConflictException si el nombre ya existe', async () => {
    findOneMock.mockResolvedValue({ id: 'existing', name: 'MERENGUE' });

    await expect(
      useCase.execute({ name: 'merengue', description: 'rico' }, user),
    ).rejects.toThrow(ConflictException);

    expect(saveMock).not.toHaveBeenCalled();
  });
});
