import { FindAllBranchEmployeesUseCase } from './find-all-branch-employees.usecase';

function createMocks() {
    const branchEmployeeRepository = {
        findAndCount: jest.fn(),
    };

    const useCase = new FindAllBranchEmployeesUseCase(
        branchEmployeeRepository as never,
    );

    return { useCase, branchEmployeeRepository };
}

const employees = [
    { id: 'e1', name: 'María', pin: 'hash-1' },
    { id: 'e2', name: 'Juan', pin: 'hash-2' },
];

describe('FindAllBranchEmployeesUseCase', () => {
    it('no incluye el PIN de ningún empleado en la respuesta paginada', async () => {
        const mocks = createMocks();
        mocks.branchEmployeeRepository.findAndCount.mockResolvedValue([
            employees,
            2,
        ]);

        const result = await mocks.useCase.execute('branch-1', {
            limit: 10,
            offset: 0,
        });

        expect('items' in result ? result.items : result).toEqual(
            expect.arrayContaining([
                expect.not.objectContaining({ pin: expect.anything() }),
            ]),
        );
        if ('items' in result) {
            result.items.forEach((item) => {
                expect(item).not.toHaveProperty('pin');
            });
            expect(result.total).toBe(2);
        } else {
            throw new Error('Expected paginated response');
        }
    });

    it('no incluye el PIN cuando no se pagina (arreglo plano)', async () => {
        const mocks = createMocks();
        mocks.branchEmployeeRepository.findAndCount.mockResolvedValue([
            employees,
            2,
        ]);

        const result = await mocks.useCase.execute('branch-1', {} as never);

        expect(Array.isArray(result)).toBe(true);
        (result as unknown[]).forEach((item) => {
            expect(item).not.toHaveProperty('pin');
        });
    });
});
