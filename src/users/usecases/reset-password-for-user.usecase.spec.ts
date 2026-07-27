import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { ResetPasswordForUserUseCase } from './reset-password-for-user.usecase';
import { UserRoles } from '../enums/user-role';
import type { ResetPasswordDto } from '../../auth/dto/reset-password.dto';
import type { User } from '../entities/user.entity';

function createMocks() {
    const userRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new ResetPasswordForUserUseCase(userRepository as never);

    return { useCase, userRepository };
}

function baseDto(overrides: Partial<ResetPasswordDto> = {}): ResetPasswordDto {
    return { username: 'jperez', newPassword: '54321', ...overrides };
}

describe('ResetPasswordForUserUseCase', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);
        const currentUser = { id: 'admin-1', role: UserRoles.ADMIN } as User;

        await expect(
            mocks.useCase.execute(baseDto(), currentUser),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el usuario actual tiene menor nivel que el objetivo', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'u1',
            role: UserRoles.ADMIN,
        });
        const currentUser = { id: 'emp-1', role: UserRoles.EMPLOYEE } as User;

        await expect(
            mocks.useCase.execute(baseDto(), currentUser),
        ).rejects.toThrow(BadRequestException);
    });

    // REGRESIÓN: a diferencia de Remove/UpdateUserUseCase (que usan `<=` y
    // bloquean actuar sobre el mismo nivel), aquí se usa `<`, así que SÍ se
    // permite resetear la contraseña de alguien del mismo nivel. Documentado
    // tal cual está hoy (flagueado en el backlog como posible inconsistencia).
    it('REGRESIÓN: permite resetear la contraseña de un usuario del mismo nivel', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'u1',
            role: UserRoles.ADMIN,
            updatedBy: null,
        });
        const currentUser = { id: 'admin-2', role: UserRoles.ADMIN } as User;

        await expect(
            mocks.useCase.execute(baseDto(), currentUser),
        ).resolves.toBeDefined();
    });

    it('hashea la nueva contraseña con argon2 y retorna el usuario saneado', async () => {
        const mocks = createMocks();
        const targetUser = {
            id: 'u1',
            role: UserRoles.EMPLOYEE,
            userkey: 'old-hash',
            updatedBy: null,
        };
        mocks.userRepository.findOne.mockResolvedValue(targetUser);
        const currentUser = { id: 'admin-1', role: UserRoles.ADMIN } as User;

        const result = await mocks.useCase.execute(
            baseDto({ newPassword: '54321' }),
            currentUser,
        );

        expect(targetUser.userkey).not.toBe('old-hash');
        expect(await argon2.verify(targetUser.userkey, '54321')).toBe(true);
        expect(targetUser.updatedBy).toBe(currentUser);
        expect(result).not.toHaveProperty('userkey');
    });
});
