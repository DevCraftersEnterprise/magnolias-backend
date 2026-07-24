import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginUseCase } from './login.usecase';

describe('LoginUseCase', () => {
    let findOneMock: jest.Mock;
    let jwtSignMock: jest.Mock;
    let configGetMock: jest.Mock;
    let useCase: LoginUseCase;

    beforeEach(() => {
        findOneMock = jest.fn();
        jwtSignMock = jest.fn(
            (payload, options) =>
                `signed:${JSON.stringify(payload)}:${options?.expiresIn ?? ''}`,
        );
        configGetMock = jest.fn((key: string) =>
            key === 'JWT_REFRESH_EXPIRY' ? '7d' : undefined,
        );

        useCase = new LoginUseCase(
            { findOne: findOneMock } as never,
            { sign: jwtSignMock } as never,
            { get: configGetMock } as never,
        );
    });

    it('lanza BadRequestException si el usuario no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(
            useCase.execute({ username: 'nadie', userkey: 'x' }, '127.0.0.1'),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el usuario está inactivo', async () => {
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'ana',
            isActive: false,
            userkey: 'hash',
        });

        await expect(
            useCase.execute({ username: 'ana', userkey: 'x' }, '127.0.0.1'),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si la contraseña no coincide', async () => {
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'ana',
            isActive: true,
            userkey: hashed,
            name: 'Ana',
            lastname: 'García',
            role: 'ADMIN',
        });

        await expect(
            useCase.execute({ username: 'ana', userkey: 'incorrecta' }, '127.0.0.1'),
        ).rejects.toThrow(BadRequestException);
    });

    it('retorna tokens y mensaje de bienvenida con credenciales correctas', async () => {
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'ana',
            isActive: true,
            userkey: hashed,
            name: 'Ana',
            lastname: 'García',
            role: 'ADMIN',
        });

        const result = await useCase.execute(
            { username: 'ana', userkey: 'correcta' },
            '127.0.0.1',
        );

        expect(result.message).toBe('Bienvenido Ana García');
        expect(jwtSignMock).toHaveBeenNthCalledWith(1, {
            id: 'u1',
            type: 'access',
        });
        expect(jwtSignMock).toHaveBeenNthCalledWith(
            2,
            { id: 'u1', type: 'refresh' },
            { expiresIn: '7d' },
        );
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
    });
});
