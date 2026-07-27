import { ConflictException } from '@nestjs/common';
import { CreateFillingUseCase } from './create-filling.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateFillingUseCase', () => {
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: CreateFillingUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    createMock = jest.fn((data) => data);
    saveMock = jest.fn((entity) =>
      Promise.resolve({ ...entity, id: 'filling-1' }),
    );

    useCase = new CreateFillingUseCase({
      findOne: findOneMock,
      create: createMock,
      save: saveMock,
    } as never);
  });

  it('crea un relleno nuevo normalizando el nombre a mayúsculas', async () => {
    findOneMock.mockResolvedValue(null);

    const result = await useCase.execute(
      { name: 'nutella', description: 'rico' },
      user,
    );

    expect(findOneMock).toHaveBeenCalledWith({
      where: { name: 'NUTELLA' },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'NUTELLA',
        createdBy: user,
        updatedBy: user,
      }),
    );
    expect(result.id).toBe('filling-1');
  });

  it('lanza ConflictException si el nombre ya existe', async () => {
    findOneMock.mockResolvedValue({ id: 'existing', name: 'NUTELLA' });

    await expect(
      useCase.execute({ name: 'nutella', description: 'rico' }, user),
    ).rejects.toThrow(ConflictException);

    expect(saveMock).not.toHaveBeenCalled();
  });
});
