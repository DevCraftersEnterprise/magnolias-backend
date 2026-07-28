import { FindAllCommonAddressesUseCase } from './find-all-common-addresses.usecase';

function createMocks() {
    const commonAddressRepository = {
        find: jest.fn(),
    };

    const useCase = new FindAllCommonAddressesUseCase(
        commonAddressRepository as never,
    );

    return { useCase, commonAddressRepository };
}

describe('FindAllCommonAddressesUseCase', () => {
    it('sin término de búsqueda: consulta todas ordenadas por usageCount DESC y name ASC', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.find.mockResolvedValue([{ id: 'a1' }]);

        const result = await mocks.useCase.execute();

        expect(mocks.commonAddressRepository.find).toHaveBeenCalledWith({
            order: { usageCount: 'DESC', name: 'ASC' },
        });
        expect(result).toEqual([{ id: 'a1' }]);
    });

    it('con término de búsqueda: filtra por name/street/neighborhood usando ILike', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.find.mockResolvedValue([]);

        await mocks.useCase.execute('roma');

        expect(mocks.commonAddressRepository.find).toHaveBeenCalledWith({
            where: [
                { name: expect.anything() },
                { street: expect.anything() },
                { neighborhood: expect.anything() },
            ],
            order: { usageCount: 'DESC', name: 'ASC' },
        });
    });

    it('retorna un arreglo vacío si no hay resultados', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.find.mockResolvedValue([]);

        const result = await mocks.useCase.execute('inexistente');

        expect(result).toEqual([]);
    });
});
