import { FindAllCustomersUseCase } from './find-all-customers.usecase';
import type { CustomersFilterDto } from '../dto/customers-filter.dto';

function createMocks() {
    const customerRepository = {
        find: jest.fn(),
        findAndCount: jest.fn(),
    };

    const useCase = new FindAllCustomersUseCase(customerRepository as never);

    return { useCase, customerRepository };
}

function baseFilter(overrides: Partial<CustomersFilterDto> = {}): CustomersFilterDto {
    return { ...overrides } as CustomersFilterDto;
}

describe('FindAllCustomersUseCase', () => {
    it('sin filtros ni paginación: usa findAndCount y retorna un arreglo plano', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([
            [{ id: 'c1' }, { id: 'c2' }],
            2,
        ]);

        const result = await mocks.useCase.execute(baseFilter());

        expect(mocks.customerRepository.findAndCount).toHaveBeenCalledWith(
            expect.objectContaining({ where: {}, take: undefined, skip: undefined }),
        );
        expect(result).toEqual([{ id: 'c1' }, { id: 'c2' }]);
    });

    it('con limit/offset: retorna PaginationResponse con metadata correcta', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([
            [{ id: 'c1' }],
            5,
        ]);

        const result = await mocks.useCase.execute(
            baseFilter({ limit: 2, offset: 2 }),
        );

        expect(mocks.customerRepository.findAndCount).toHaveBeenCalledWith(
            expect.objectContaining({ take: 2, skip: 2 }),
        );
        expect(result).toEqual({
            items: [{ id: 'c1' }],
            total: 5,
            pagination: { limit: 2, offset: 2, totalPages: 3, currentPage: 2 },
        });
    });

    it('filtra por nombre usando ILike sobre fullName', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([[], 0]);

        await mocks.useCase.execute(baseFilter({ name: 'Juan' }));

        const callArg = mocks.customerRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.fullName).toBeDefined();
    });

    it('filtra por isActive cuando viene definido', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([[], 0]);

        await mocks.useCase.execute(baseFilter({ isActive: false }));

        expect(mocks.customerRepository.findAndCount).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isActive: false } }),
        );
    });

    it('con phone: usa find (no findAndCount) y filtra en memoria por prefijo', async () => {
        const mocks = createMocks();
        mocks.customerRepository.find.mockResolvedValue([
            { id: 'c1', phone: '5512345678' },
            { id: 'c2', phone: '5599999999' },
        ]);

        const result = await mocks.useCase.execute(baseFilter({ phone: '5512' }));

        expect(mocks.customerRepository.findAndCount).not.toHaveBeenCalled();
        expect(mocks.customerRepository.find).toHaveBeenCalled();
        expect(result).toEqual([{ id: 'c1', phone: '5512345678' }]);
    });

    it('con phone + limit/offset: aplica paginación manual sobre el resultado filtrado', async () => {
        const mocks = createMocks();
        mocks.customerRepository.find.mockResolvedValue([
            { id: 'c1', phone: '5510000001' },
            { id: 'c2', phone: '5510000002' },
            { id: 'c3', phone: '5510000003' },
        ]);

        const result = await mocks.useCase.execute(
            baseFilter({ phone: '551', limit: 1, offset: 1 }),
        );

        expect(result).toEqual({
            items: [{ id: 'c2', phone: '5510000002' }],
            total: 3,
            pagination: { limit: 1, offset: 1, totalPages: 3, currentPage: 2 },
        });
    });
});
