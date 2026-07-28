import { FindAllStylesUseCase } from './find-all-styles.usecase';

describe('FindAllStylesUseCase', () => {
    let findAndCountMock: jest.Mock;
    let useCase: FindAllStylesUseCase;

    beforeEach(() => {
        findAndCountMock = jest.fn();
        useCase = new FindAllStylesUseCase({
            findAndCount: findAndCountMock,
        } as never);
    });

    it('filtra por isActive cuando viene definido', async () => {
        findAndCountMock.mockResolvedValue([[], 0]);

        await useCase.execute({ isActive: false });

        expect(findAndCountMock).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isActive: false } }),
        );
    });

    it('no filtra por isActive cuando no viene definido', async () => {
        findAndCountMock.mockResolvedValue([[], 0]);

        await useCase.execute({});

        expect(findAndCountMock).toHaveBeenCalledWith(
            expect.objectContaining({ where: {} }),
        );
    });

    it('retorna la respuesta paginada cuando se envían limit y offset', async () => {
        findAndCountMock.mockResolvedValue([[{ id: '1', name: 'RÚSTICO' }], 1]);

        const result = await useCase.execute({ limit: 10, offset: 0 });

        expect(result).toEqual({
            items: [{ id: '1', name: 'RÚSTICO' }],
            total: 1,
            pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
        });
    });

    it('retorna un arreglo plano cuando no se envían limit/offset', async () => {
        findAndCountMock.mockResolvedValue([[{ id: '1', name: 'RÚSTICO' }], 1]);

        const result = await useCase.execute({});

        expect(Array.isArray(result)).toBe(true);
    });
});
