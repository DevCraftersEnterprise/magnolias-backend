import { ConflictException } from '@nestjs/common';
import { CreateFruitUseCase } from './create-fruit.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateFruitUseCase', () => {
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let useCase: CreateFruitUseCase;
  const user = { id: 'user-1' } as User;

  beforeEach(() => {
    findOneMock = jest.fn();
    createMock = jest.fn((data) => data);
    saveMock = jest.fn((entity) =>
      Promise.resolve({ ...entity, id: 'fruit-1' }),
    );

    useCase = new CreateFruitUseCase({
      findOne: findOneMock,
      create: createMock,
      save: saveMock,
    } as never);
  });

  it('crea una fruta nueva normalizando el nombre a mayúsculas', async () => {
    findOneMock.mockResolvedValue(null);

    const result = await useCase.execute(
      { name: 'fresa', description: 'fresca' },
      user,
    );

    expect(findOneMock).toHaveBeenCalledWith({
      where: { name: 'FRESA' },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'FRESA',
        createdBy: user,
        updatedBy: user,
      }),
    );
    expect(result.id).toBe('fruit-1');
  });

  it('lanza ConflictException si el nombre ya existe', async () => {
    findOneMock.mockResolvedValue({ id: 'existing', name: 'FRESA' });

    await expect(
      useCase.execute({ name: 'fresa', description: 'fresca' }, user),
    ).rejects.toThrow(ConflictException);

    expect(saveMock).not.toHaveBeenCalled();
  });
});
