import { FindAllBranchesUseCase } from './find-all-branches.usecase';
import type { BranchesFilterDto } from '../../dto/branches-filter.dto';

function createMocks() {
    const branchRepository = {
        findAndCount: jest.fn(),
    };

    const useCase = new FindAllBranchesUseCase(branchRepository as never);

    return { useCase, branchRepository };
}

function baseFilter(overrides: Partial<BranchesFilterDto> = {}): BranchesFilterDto {
    return { ...overrides } as BranchesFilterDto;
}

describe('FindAllBranchesUseCase', () => {
    it('sin filtros ni paginación: retorna un arreglo plano', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findAndCount.mockResolvedValue([
            [{ id: 'b1' }, { id: 'b2' }],
            2,
        ]);

        const result = await mocks.useCase.execute(baseFilter());

        expect(mocks.branchRepository.findAndCount).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { name: undefined, address: undefined },
                skip: undefined,
                take: undefined,
            }),
        );
        expect(result).toEqual([{ id: 'b1' }, { id: 'b2' }]);
    });

    it('con limit/offset: retorna PaginationResponse con metadata correcta', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findAndCount.mockResolvedValue([[{ id: 'b1' }], 5]);

        const result = await mocks.useCase.execute(
            baseFilter({ limit: 2, offset: 2 }),
        );

        expect(result).toEqual({
            items: [{ id: 'b1' }],
            total: 5,
            pagination: { limit: 2, offset: 2, totalPages: 3, currentPage: 2 },
        });
    });

    it('filtra por name usando ILike', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findAndCount.mockResolvedValue([[], 0]);

        await mocks.useCase.execute(baseFilter({ name: 'Centro' }));

        const callArg = mocks.branchRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.name).toBeDefined();
        expect(callArg.where.address).toBeUndefined();
    });

    it('filtra por address usando ILike', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findAndCount.mockResolvedValue([[], 0]);

        await mocks.useCase.execute(baseFilter({ address: 'Insurgentes' }));

        const callArg = mocks.branchRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.address).toBeDefined();
    });
});
