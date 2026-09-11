import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
        // Como en el .env real: un string SIN unidad (p.ej. "604800"), no
        // "7d". El usecase debe convertirlo a número antes de firmarlo.
        configGetMock = jest.fn((key: string) =>
            key === 'JWT_REFRESH_EXPIRY' ? '604800' : undefined,
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
        // expiresIn debe ser el NÚMERO 604800, no el string "604800":
        // jsonwebtoken interpreta un string sin unidad como milisegundos.
        expect(jwtSignMock).toHaveBeenNthCalledWith(
            2,
            { id: 'u1', type: 'refresh' },
            { expiresIn: 604800 },
        );
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
    });

    it('emite un refresh token que en verdad dura JWT_REFRESH_EXPIRY segundos (con un JwtService real)', async () => {
        // Regresión: sin Number(...), un string sin unidad como "604800" se
        // interpreta como milisegundos (~10 min en vez de 7 días).
        const jwtService = new JwtService({ secret: 'test-secret' });
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
        const realUseCase = new LoginUseCase(
            { findOne: findOneMock } as never,
            jwtService,
            { get: configGetMock } as never,
        );

        const result = await realUseCase.execute(
            { username: 'ana', userkey: 'correcta' },
            '127.0.0.1',
        );

        const decoded = jwtService.decode(result.refreshToken) as {
            iat: number;
            exp: number;
        };
        expect(decoded.exp - decoded.iat).toBe(604800);
    });
});
