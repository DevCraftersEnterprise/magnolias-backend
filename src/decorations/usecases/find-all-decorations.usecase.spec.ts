import { FindAllDecorationsUseCase } from './find-all-decorations.usecase';

describe('FindAllDecorationsUseCase', () => {
  let findAndCountMock: jest.Mock;
  let useCase: FindAllDecorationsUseCase;

  beforeEach(() => {
    findAndCountMock = jest.fn();
    useCase = new FindAllDecorationsUseCase({
      findAndCount: findAndCountMock,
    } as never);
  });

  it('retorna la respuesta paginada cuando se envían limit y offset', async () => {
    findAndCountMock.mockResolvedValue([
      [{ id: '1', name: 'PERLAS DORADAS' }],
      1,
    ]);

    const result = await useCase.execute({ limit: 10, offset: 0 });

    expect(findAndCountMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 0, order: { name: 'ASC' } }),
    );
    expect(result).toEqual({
      items: [{ id: '1', name: 'PERLAS DORADAS' }],
      total: 1,
      pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
    });
  });

  it('retorna un arreglo plano cuando no se envían limit/offset', async () => {
    findAndCountMock.mockResolvedValue([
      [{ id: '1', name: 'PERLAS DORADAS' }],
      1,
    ]);

    const result = await useCase.execute({});

    expect(Array.isArray(result)).toBe(true);
  });
});
