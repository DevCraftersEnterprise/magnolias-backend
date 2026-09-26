import { ConflictException } from '@nestjs/common';
import { CreateDecorationUseCase } from './create-decoration.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateDecorationUseCase', () => {
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: CreateDecorationUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    createMock = jest.fn((data) => data);
    saveMock = jest.fn((entity) =>
      Promise.resolve({ ...entity, id: 'decoration-1' }),
    );

    useCase = new CreateDecorationUseCase({
      findOne: findOneMock,
      create: createMock,
      save: saveMock,
    } as never);
  });

  it('crea una decoración nueva normalizando el nombre a mayúsculas', async () => {
    findOneMock.mockResolvedValue(null);

    const result = await useCase.execute(
      { name: 'perlas doradas', description: 'para el borde' },
      user,
    );

    expect(findOneMock).toHaveBeenCalledWith({
      where: { name: 'PERLAS DORADAS' },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'PERLAS DORADAS',
        createdBy: user,
        updatedBy: user,
      }),
    );
    expect(result.id).toBe('decoration-1');
  });

  it('lanza ConflictException si el nombre ya existe', async () => {
    findOneMock.mockResolvedValue({ id: 'existing', name: 'PERLAS DORADAS' });

    await expect(
      useCase.execute(
        { name: 'perlas doradas', description: 'para el borde' },
        user,
      ),
    ).rejects.toThrow(ConflictException);

    expect(saveMock).not.toHaveBeenCalled();
  });
});
