import { NotFoundException } from '@nestjs/common';
import { FindOneFrostingUseCase } from './find-one-frosting.usecase';

describe('FindOneFrostingUseCase', () => {
  let findOneMock: jest.Mock;
  let useCase: FindOneFrostingUseCase;
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    findOneMock = jest.fn();
    useCase = new FindOneFrostingUseCase({ findOne: findOneMock } as never);
  });

  it('busca por id cuando el término es un UUID', async () => {
    findOneMock.mockResolvedValue({ id: VALID_UUID });

    await useCase.execute(VALID_UUID);

    expect(findOneMock).toHaveBeenCalledWith({ where: { id: VALID_UUID } });
  });

  it('busca por nombre en mayúsculas cuando el término no es un UUID', async () => {
    findOneMock.mockResolvedValue({ id: '1', name: 'MERENGUE' });

    await useCase.execute('merengue');

    expect(findOneMock).toHaveBeenCalledWith({ where: { name: 'MERENGUE' } });
  });

  it('lanza NotFoundException si no encuentra el betún', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
