import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.usecase';
import { UserRoles } from '../enums/user-role';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { User } from '../entities/user.entity';

function createMocks() {
    const userRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const branchRepository = {
        findOne: jest.fn(),
    };

    const useCase = new UpdateUserUseCase(
        userRepository as never,
        branchRepository as never,
    );

    return { useCase, userRepository, branchRepository };
}

const admin = { id: 'admin-1', role: UserRoles.ADMIN } as User;

function baseTargetUser(overrides: Record<string, unknown> = {}) {
    return {
        id: 'u1',
        role: UserRoles.EMPLOYEE,
        branch: null,
        branches: [],
        ...overrides,
    };
}

describe('UpdateUserUseCase', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute({ id: 'u1' } as UpdateUserDto, admin),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el nivel del usuario actual no es mayor al del objetivo', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(
            baseTargetUser({ role: UserRoles.ADMIN }),
        );

        await expect(
            mocks.useCase.execute({ id: 'u1' } as UpdateUserDto, admin),
        ).rejects.toThrow(BadRequestException);
    });

    it('limpia branches si el usuario deja de ser BAKER', async () => {
        const mocks = createMocks();
        const targetUser = baseTargetUser({
            role: UserRoles.BAKER,
            branches: [{ id: 'b1' }],
        });
        mocks.userRepository.findOne.mockResolvedValue(targetUser);
        mocks.branchRepository.findOne.mockResolvedValue({ id: 'b2' });

        await mocks.useCase.execute(
            { id: 'u1', role: UserRoles.EMPLOYEE, branchId: 'b2' } as UpdateUserDto,
            admin,
        );

        expect(targetUser.branches).toEqual([]);
    });

    it('lanza BadRequestException si el nuevo rol es BAKER sin branchIds', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baseTargetUser());

        await expect(
            mocks.useCase.execute(
                { id: 'u1', role: UserRoles.BAKER } as UpdateUserDto,
                admin,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('asigna las sucursales y limpia branch al pasar a BAKER con branchIds válidos', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baseTargetUser());
        const branch1 = { id: 'b1' };
        mocks.branchRepository.findOne.mockResolvedValue(branch1);

        const result = await mocks.useCase.execute(
            { id: 'u1', role: UserRoles.BAKER, branchIds: ['b1'] } as UpdateUserDto,
            admin,
        );

        expect(result.branches).toEqual([branch1]);
        expect(result.branch).toBeNull();
    });

    it('lanza BadRequestException si algún branchId no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baseTargetUser());
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(
                {
                    id: 'u1',
                    role: UserRoles.BAKER,
                    branchIds: ['no-existe'],
                } as UpdateUserDto,
                admin,
            ),
        ).rejects.toThrow(BadRequestException);
    });


    it('lanza NotFoundException si branchId (rol no-BAKER) no corresponde a una sucursal existente', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(baseTargetUser());
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(
                { id: 'u1', branchId: 'no-existe' } as UpdateUserDto,
                admin,
            ),
        ).rejects.toThrow(NotFoundException);
    });

    it('asigna branch y limpia branches al recibir un branchId válido (rol no-BAKER)', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(
            baseTargetUser({ branches: [{ id: 'old' }] }),
        );
        const branch = { id: 'b1' };
        mocks.branchRepository.findOne.mockResolvedValue(branch);

        const result = await mocks.useCase.execute(
            { id: 'u1', branchId: 'b1' } as UpdateUserDto,
            admin,
        );

        expect(result.branch).toEqual(branch);
        expect(result.branches).toEqual([]);
    });

    it('retorna el usuario saneado sin exponer userkey', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(
            baseTargetUser({ userkey: 'hash' }),
        );

        const result = await mocks.useCase.execute(
            { id: 'u1', name: 'Nuevo nombre' } as UpdateUserDto,
            admin,
        );

        expect(result.name).toBe('Nuevo nombre');
        expect(result).not.toHaveProperty('userkey');
    });
});
