import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { VerifyDiscountAuthorizationUseCase } from './verify-discount-authorization.usecase';

describe('VerifyDiscountAuthorizationUseCase', () => {
    let findOneMock: jest.Mock;
    let jwtSignMock: jest.Mock;
    let configGetMock: jest.Mock;
    let useCase: VerifyDiscountAuthorizationUseCase;

    beforeEach(() => {
        findOneMock = jest.fn();
        jwtSignMock = jest.fn(
            (payload, options) =>
                `signed:${JSON.stringify(payload)}:${options?.expiresIn ?? ''}`,
        );
        // Como en el .env real: un string SIN unidad (p.ej. "600"), no
        // "10m". El usecase debe convertirlo a número antes de firmarlo.
        configGetMock = jest.fn((key: string) =>
            key === 'DISCOUNT_AUTH_TOKEN_EXPIRY' ? '600' : undefined,
        );

        useCase = new VerifyDiscountAuthorizationUseCase(
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
            username: 'admin',
            isActive: false,
            userkey: 'hash',
            role: 'ADMIN',
        });

        await expect(
            useCase.execute({ username: 'admin', userkey: 'x' }, '127.0.0.1'),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si la contraseña no coincide', async () => {
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'admin',
            isActive: true,
            userkey: hashed,
            role: 'ADMIN',
        });

        await expect(
            useCase.execute(
                { username: 'admin', userkey: 'incorrecta' },
                '127.0.0.1',
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el usuario no es ADMIN ni SUPER', async () => {
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'empleado',
            isActive: true,
            userkey: hashed,
            role: 'EMPLOYEE',
        });

        await expect(
            useCase.execute(
                { username: 'empleado', userkey: 'correcta' },
                '127.0.0.1',
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('retorna un token de descuento cuando el usuario es ADMIN', async () => {
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'admin',
            isActive: true,
            userkey: hashed,
            role: 'ADMIN',
        });

        const result = await useCase.execute(
            { username: 'admin', userkey: 'correcta' },
            '127.0.0.1',
        );

        // expiresIn debe ser el NÚMERO 600, no el string "600": jsonwebtoken
        // interpreta un string sin unidad como milisegundos, lo que haría
        // que el token naciera prácticamente ya vencido.
        expect(jwtSignMock).toHaveBeenCalledWith(
            { id: 'u1', type: 'discount-authorization' },
            { expiresIn: 600 },
        );
        expect(result.discountAuthToken).toBeDefined();
    });

    it('retorna un token de descuento cuando el usuario es SUPER', async () => {
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u2',
            username: 'super',
            isActive: true,
            userkey: hashed,
            role: 'SUPER',
        });

        const result = await useCase.execute(
            { username: 'super', userkey: 'correcta' },
            '127.0.0.1',
        );

        expect(result.discountAuthToken).toBeDefined();
    });

    it('emite un token que en verdad dura DISCOUNT_AUTH_TOKEN_EXPIRY segundos (con un JwtService real)', async () => {
        // Regresión: sin Number(...), un string sin unidad como "600" se
        // interpreta como milisegundos (0.6s, redondeado a 0 → token ya
        // vencido al nacer).
        const jwtService = new JwtService({ secret: 'test-secret' });
        const hashed = await argon2.hash('correcta');
        findOneMock.mockResolvedValue({
            id: 'u1',
            username: 'admin',
            isActive: true,
            userkey: hashed,
            role: 'ADMIN',
        });
        const realUseCase = new VerifyDiscountAuthorizationUseCase(
            { findOne: findOneMock } as never,
            jwtService,
            { get: configGetMock } as never,
        );

        const result = await realUseCase.execute(
            { username: 'admin', userkey: 'correcta' },
            '127.0.0.1',
        );

        const decoded = jwtService.decode(result.discountAuthToken) as {
            iat: number;
            exp: number;
        };
        expect(decoded.exp - decoded.iat).toBe(600);
    });
});
