import { FindAllProductsUseCase } from './find-all-products.usecase';
import type { ProductsFilterDto } from '../dto/products-filter.dto';

function createMocks() {
  const productRepository = {
    findAndCount: jest.fn(),
  };

  const useCase = new FindAllProductsUseCase(productRepository as never);

  return { useCase, productRepository };
}

function baseFilter(overrides: Partial<ProductsFilterDto> = {}): ProductsFilterDto {
  return { ...overrides } as ProductsFilterDto;
}

describe('FindAllProductsUseCase', () => {
  it('sin filtros ni paginación: filtra por isPublic=true y retorna un arreglo plano', async () => {
    const mocks = createMocks();
    mocks.productRepository.findAndCount.mockResolvedValue([
      [{ id: 'p1' }, { id: 'p2' }],
      2,
    ]);

    const result = await mocks.useCase.execute(baseFilter());

    expect(mocks.productRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublic: true },
        skip: undefined,
        take: undefined,
      }),
    );
    expect(result).toEqual([{ id: 'p1' }, { id: 'p2' }]);
  });

  it('con includeHidden=true: no filtra por isPublic (ve también productos ocultos)', async () => {
    const mocks = createMocks();
    mocks.productRepository.findAndCount.mockResolvedValue([
      [{ id: 'p1' }, { id: 'p2', isPublic: false }],
      2,
    ]);

    await mocks.useCase.execute(baseFilter({ includeHidden: true }));

    expect(mocks.productRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });


  it('con limit/offset: retorna PaginationResponse con metadata correcta', async () => {
    const mocks = createMocks();
    mocks.productRepository.findAndCount.mockResolvedValue([[{ id: 'p1' }], 5]);

    const result = await mocks.useCase.execute(
      baseFilter({ limit: 2, offset: 2 }),
    );

    expect(result).toEqual({
      items: [{ id: 'p1' }],
      total: 5,
      pagination: { limit: 2, offset: 2, totalPages: 3, currentPage: 2 },
    });
  });

  it('filtra por name usando ILike', async () => {
    const mocks = createMocks();
    mocks.productRepository.findAndCount.mockResolvedValue([[], 0]);

    await mocks.useCase.execute(baseFilter({ name: 'Chocolate' }));

    const callArg = mocks.productRepository.findAndCount.mock.calls[0][0];
    expect(callArg.where.name).toBeDefined();
  });

  it('filtra por description usando ILike', async () => {
    const mocks = createMocks();
    mocks.productRepository.findAndCount.mockResolvedValue([[], 0]);

    await mocks.useCase.execute(baseFilter({ description: 'ganache' }));

    const callArg = mocks.productRepository.findAndCount.mock.calls[0][0];
    expect(callArg.where.description).toBeDefined();
  });
});
