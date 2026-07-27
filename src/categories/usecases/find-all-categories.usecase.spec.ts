import { FindAllCategoriesUseCase } from './find-all-categories.usecase';

describe('FindAllCategoriesUseCase', () => {
    let findAndCountMock: jest.Mock;
    let useCase: FindAllCategoriesUseCase;

    beforeEach(() => {
        findAndCountMock = jest.fn();
        useCase = new FindAllCategoriesUseCase({
            findAndCount: findAndCountMock,
        } as never);
    });

    it('carga la categoría junto con sus productos y las fotos de cada uno', async () => {
        findAndCountMock.mockResolvedValue([[{ id: 'cat-1', products: [] }], 1]);

        await useCase.execute({});

        const callArg = findAndCountMock.mock.calls[0][0];
        expect(callArg.relations).toEqual({
            products: { category: true, pictures: true },
        });
    });

    it('retorna la respuesta paginada cuando se envían limit y offset', async () => {
        findAndCountMock.mockResolvedValue([[{ id: 'cat-1' }], 1]);

        const result = await useCase.execute({ limit: 10, offset: 0 });

        expect(result).toEqual({
            items: [{ id: 'cat-1' }],
            total: 1,
            pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
        });
    });

    it('retorna un arreglo plano cuando no se envían limit/offset', async () => {
        findAndCountMock.mockResolvedValue([[{ id: 'cat-1' }], 1]);

        const result = await useCase.execute({});

        expect(Array.isArray(result)).toBe(true);
    });
});
