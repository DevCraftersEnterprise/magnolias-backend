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

    it('con phone: el scan en memoria trae como máximo el cap configurado', async () => {
        const mocks = createMocks();
        mocks.customerRepository.find.mockResolvedValue([]);

        await mocks.useCase.execute(baseFilter({ phone: '551' }));

        const callArg = mocks.customerRepository.find.mock.calls[0][0];
        expect(callArg.take).toBe(1000);
    });

    it('con phone: registra un warning si el scan alcanza el cap', async () => {
        const mocks = createMocks();
        const capResults = Array.from({ length: 1000 }, (_, i) => ({
            id: `c${i}`,
            phone: `551${String(i).padStart(7, '0')}`,
        }));
        mocks.customerRepository.find.mockResolvedValue(capResults);
        const warnSpy = jest
            .spyOn(mocks.useCase['logger'], 'warn')
            .mockImplementation(() => undefined);

        await mocks.useCase.execute(baseFilter({ phone: '551' }));

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('cap'),
        );
    });

    it('con last4: usa findAndCount filtrando por phoneLast4 y no aplica paginación manual', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([
            [{ id: 'c1', phone: '5512344567' }],
            1,
        ]);

        const result = await mocks.useCase.execute(
            baseFilter({ last4: '4567', limit: 10, offset: 0 }),
        );

        expect(mocks.customerRepository.find).not.toHaveBeenCalled();
        expect(mocks.customerRepository.findAndCount).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ phoneLast4: '4567' }),
                take: 10,
                skip: 0,
            }),
        );
        expect(result).toEqual({
            items: [{ id: 'c1', phone: '5512344567' }],
            total: 1,
            pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
        });
    });

    it('con last4 y name/isActive: combina los filtros', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([[], 0]);

        await mocks.useCase.execute(
            baseFilter({ last4: '4567', name: 'Juan', isActive: true }),
        );

        const callArg = mocks.customerRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.phoneLast4).toBe('4567');
        expect(callArg.where.fullName).toBeDefined();
        expect(callArg.where.isActive).toBe(true);
    });

    it('prioriza last4 sobre phone cuando ambos vienen en el filtro', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findAndCount.mockResolvedValue([[], 0]);

        await mocks.useCase.execute(baseFilter({ last4: '4567', phone: '551' }));

        expect(mocks.customerRepository.find).not.toHaveBeenCalled();
        expect(mocks.customerRepository.findAndCount).toHaveBeenCalled();
    });
});
