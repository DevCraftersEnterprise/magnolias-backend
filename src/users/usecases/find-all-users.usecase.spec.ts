import { And, Equal, Not } from 'typeorm';
import { FindAllUsersUseCase } from './find-all-users.usecase';
import { UserRoles } from '../enums/user-role';
import type { UsersFilterDto } from '../dto/users-filter.dto';
import type { User } from '../entities/user.entity';

function createMocks() {
    const userRepository = {
        findAndCount: jest.fn(),
    };

    const useCase = new FindAllUsersUseCase(userRepository as never);

    return { useCase, userRepository };
}

function baseFilter(overrides: Partial<UsersFilterDto> = {}): UsersFilterDto {
    return { ...overrides } as UsersFilterDto;
}

describe('FindAllUsersUseCase', () => {
    it('excluye siempre al usuario que hace la consulta', async () => {
        const mocks = createMocks();
        mocks.userRepository.findAndCount.mockResolvedValue([[], 0]);
        const requester = { id: 'me', role: UserRoles.ADMIN } as User;

        await mocks.useCase.execute(baseFilter(), requester);

        const callArg = mocks.userRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.id).toEqual(Not('me'));
    });

    it('si el usuario que consulta es SUPER: aplica el filtro de rol tal cual (o ninguno)', async () => {
        const mocks = createMocks();
        mocks.userRepository.findAndCount.mockResolvedValue([[], 0]);
        const requester = { id: 'me', role: UserRoles.SUPER } as User;

        await mocks.useCase.execute(baseFilter({ role: UserRoles.ADMIN }), requester);

        const callArg = mocks.userRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.role).toBe(UserRoles.ADMIN);
    });

    it('si el usuario que consulta NO es SUPER y no filtra por rol: excluye a los SUPER', async () => {
        const mocks = createMocks();
        mocks.userRepository.findAndCount.mockResolvedValue([[], 0]);
        const requester = { id: 'me', role: UserRoles.ADMIN } as User;

        await mocks.useCase.execute(baseFilter(), requester);

        const callArg = mocks.userRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.role).toEqual(Not(UserRoles.SUPER));
    });

    it('si el usuario que consulta NO es SUPER y filtra por rol: combina Not(SUPER) con el rol pedido', async () => {
        const mocks = createMocks();
        mocks.userRepository.findAndCount.mockResolvedValue([[], 0]);
        const requester = { id: 'me', role: UserRoles.ADMIN } as User;

        await mocks.useCase.execute(
            baseFilter({ role: UserRoles.EMPLOYEE }),
            requester,
        );

        const callArg = mocks.userRepository.findAndCount.mock.calls[0][0];
        expect(callArg.where.role).toEqual(
            And(Not(UserRoles.SUPER), Equal(UserRoles.EMPLOYEE)),
        );
    });

    it('sin limit/offset: retorna un arreglo plano', async () => {
        const mocks = createMocks();
        mocks.userRepository.findAndCount.mockResolvedValue([[{ id: 'u1' }], 1]);
        const requester = { id: 'me', role: UserRoles.ADMIN } as User;

        const result = await mocks.useCase.execute(baseFilter(), requester);

        expect(result).toEqual([{ id: 'u1' }]);
    });

    it('con limit/offset: retorna PaginationResponse con metadata correcta', async () => {
        const mocks = createMocks();
        mocks.userRepository.findAndCount.mockResolvedValue([[{ id: 'u1' }], 5]);
        const requester = { id: 'me', role: UserRoles.ADMIN } as User;

        const result = await mocks.useCase.execute(
            baseFilter({ limit: 2, offset: 2 }),
            requester,
        );

        expect(result).toEqual({
            items: [{ id: 'u1' }],
            total: 5,
            pagination: { limit: 2, offset: 2, totalPages: 3, currentPage: 2 },
        });
    });
});
