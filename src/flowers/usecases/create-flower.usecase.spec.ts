import { ConflictException } from '@nestjs/common';
import { CreateFlowerUseCase } from './create-flower.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateFlowerUseCase', () => {
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: CreateFlowerUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    createMock = jest.fn((data) => data);
    saveMock = jest.fn((entity) =>
      Promise.resolve({ ...entity, id: 'flower-1' }),
    );

    useCase = new CreateFlowerUseCase({
      findOne: findOneMock,
      create: createMock,
      save: saveMock,
    } as never);
  });

  it('crea una flor nueva normalizando el nombre a mayúsculas', async () => {
    findOneMock.mockResolvedValue(null);

    const result = await useCase.execute(
      { name: 'rosa', description: 'rosa roja' },
      user,
    );

    expect(findOneMock).toHaveBeenCalledWith({
      where: { name: 'ROSA' },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ROSA',
        createdBy: user,
        updatedBy: user,
      }),
    );
    expect(result.id).toBe('flower-1');
  });

  it('lanza ConflictException si el nombre ya existe', async () => {
    findOneMock.mockResolvedValue({ id: 'existing', name: 'ROSA' });

    await expect(
      useCase.execute({ name: 'rosa', description: 'x' }, user),
    ).rejects.toThrow(ConflictException);

    expect(saveMock).not.toHaveBeenCalled();
  });
});
