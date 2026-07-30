import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RegisterUserUseCase } from './register-user.usecase';
import { UserRoles } from '../enums/user-role';
import type { RegisterUserDto } from '../dto/register-user.dto';

function createMocks() {
    const userRepository = {
        findOne: jest.fn(),
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const branchRepository = {
        findOne: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(
        userRepository as never,
        branchRepository as never,
    );

    return { useCase, userRepository, branchRepository };
}

function baseDto(overrides: Partial<RegisterUserDto> = {}): RegisterUserDto {
    return {
        name: 'Juan',
        lastname: 'Pérez',
        username: 'jperez',
        userkey: '12345',
        role: UserRoles.ADMIN,
        ...overrides,
    } as RegisterUserDto;
}

describe('RegisterUserUseCase', () => {
    it('lanza BadRequestException si el username ya existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({ id: 'existing' });

        await expect(mocks.useCase.execute(baseDto())).rejects.toThrow(
            BadRequestException,
        );
    });

    it('lanza BadRequestException si el rol es BAKER y no trae branchIds', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(baseDto({ role: UserRoles.BAKER })),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el rol requiere sucursal (EMPLOYEE) y no trae branchId', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(baseDto({ role: UserRoles.EMPLOYEE })),
        ).rejects.toThrow(BadRequestException);
    });

    it('hashea userkey con argon2 (no lo guarda en texto plano)', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await mocks.useCase.execute(baseDto());

        const createdArg = mocks.userRepository.create.mock.calls[0][0];
        expect(createdArg.userkey).not.toBe('12345');
        expect(await argon2.verify(createdArg.userkey, '12345')).toBe(true);
    });

    it('lanza BadRequestException si branchId no corresponde a una sucursal existente', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(
                baseDto({ role: UserRoles.EMPLOYEE, branchId: 'no-existe' }),
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('asigna la sucursal cuando branchId es válido', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);
        const branch = { id: 'branch-1', name: 'Centro' };
        mocks.branchRepository.findOne.mockResolvedValue(branch);

        await mocks.useCase.execute(
            baseDto({ role: UserRoles.EMPLOYEE, branchId: 'branch-1' }),
        );

        expect(mocks.userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ branch }),
        );
    });

    it('asigna las sucursales cuando branchIds son todos válidos (rol BAKER)', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);
        const branch1 = { id: 'b1' };
        const branch2 = { id: 'b2' };
        mocks.branchRepository.findOne
            .mockResolvedValueOnce(branch1)
            .mockResolvedValueOnce(branch2);

        await mocks.useCase.execute(
            baseDto({ role: UserRoles.BAKER, branchIds: ['b1', 'b2'] }),
        );

        expect(mocks.userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ branches: [branch1, branch2] }),
        );
    });

    it('lanza BadRequestException si algún branchId de branchIds no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);
        const validBranch = { id: 'b1' };
        mocks.branchRepository.findOne
            .mockResolvedValueOnce(validBranch)
            .mockResolvedValueOnce(null);

        await expect(
            mocks.useCase.execute(
                baseDto({ role: UserRoles.BAKER, branchIds: ['b1', 'no-existe'] }),
            ),
        ).rejects.toThrow(BadRequestException);

        expect(mocks.userRepository.create).not.toHaveBeenCalled();
    });


    it('retorna el usuario saneado sin exponer userkey', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        const result = await mocks.useCase.execute(baseDto());

        expect(result).not.toHaveProperty('userkey');
        expect(result.username).toBe('jperez');
    });
});
