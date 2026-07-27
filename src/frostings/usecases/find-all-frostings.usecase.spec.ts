import { FindAllFrostingsUseCase } from './find-all-frostings.usecase';

describe('FindAllFrostingsUseCase', () => {
  let findAndCountMock: jest.Mock;
  let useCase: FindAllFrostingsUseCase;

  beforeEach(() => {
    findAndCountMock = jest.fn();
    useCase = new FindAllFrostingsUseCase({
      findAndCount: findAndCountMock,
    } as never);
  });

  it('retorna la respuesta paginada cuando se envían limit y offset', async () => {
    findAndCountMock.mockResolvedValue([[{ id: '1', name: 'MERENGUE' }], 1]);

    const result = await useCase.execute({ limit: 10, offset: 0 });

    expect(findAndCountMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 0, order: { name: 'ASC' } }),
    );
    expect(result).toEqual({
      items: [{ id: '1', name: 'MERENGUE' }],
      total: 1,
      pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
    });
  });

  it('retorna un arreglo plano cuando no se envían limit/offset', async () => {
    findAndCountMock.mockResolvedValue([[{ id: '1', name: 'MERENGUE' }], 1]);

    const result = await useCase.execute({});

    expect(Array.isArray(result)).toBe(true);
  });
});
