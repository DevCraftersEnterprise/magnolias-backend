import { NotFoundException } from '@nestjs/common';
import { FindOneFruitUseCase } from './find-one-fruit.usecase';

describe('FindOneFruitUseCase', () => {
  let findOneMock: jest.Mock;
  let useCase: FindOneFruitUseCase;
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    findOneMock = jest.fn();
    useCase = new FindOneFruitUseCase({ findOne: findOneMock } as never);
  });

  it('busca por id cuando el término es un UUID', async () => {
    findOneMock.mockResolvedValue({ id: VALID_UUID });

    await useCase.execute(VALID_UUID);

    expect(findOneMock).toHaveBeenCalledWith({ where: { id: VALID_UUID } });
  });

  it('busca por nombre en mayúsculas cuando el término no es un UUID', async () => {
    findOneMock.mockResolvedValue({ id: '1', name: 'FRESA' });

    await useCase.execute('fresa');

    expect(findOneMock).toHaveBeenCalledWith({ where: { name: 'FRESA' } });
  });

  it('lanza NotFoundException si no encuentra la fruta', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
