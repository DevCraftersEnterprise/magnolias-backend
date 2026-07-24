import { BadRequestException } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import type { User } from '../../users/entities/user.entity';

describe('RefreshTokenUseCase', () => {
    let jwtVerifyMock: jest.Mock;
    let jwtSignMock: jest.Mock;
    let configGetMock: jest.Mock;
    let findUserByTermMock: jest.Mock;
    let useCase: RefreshTokenUseCase;

    const currentUser = { id: 'u1', isActive: true } as User;

    beforeEach(() => {
        jwtVerifyMock = jest.fn();
        jwtSignMock = jest.fn(
            (payload, options) =>
                `signed:${JSON.stringify(payload)}:${options?.expiresIn ?? ''}`,
        );
        configGetMock = jest.fn((key: string) =>
            key === 'JWT_REFRESH_EXPIRY' ? '7d' : undefined,
        );
        findUserByTermMock = jest.fn();

        useCase = new RefreshTokenUseCase(
            { findUserByTerm: findUserByTermMock } as never,
            { verify: jwtVerifyMock, sign: jwtSignMock } as never,
            { get: configGetMock } as never,
        );
    });

    it('lanza BadRequestException si el tipo de token no es "refresh"', async () => {
        jwtVerifyMock.mockReturnValue({ id: 'u1', type: 'access' });

        await expect(useCase.execute('token', currentUser)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('lanza BadRequestException si el id del token no coincide con el usuario actual', async () => {
        jwtVerifyMock.mockReturnValue({ id: 'otro-id', type: 'refresh' });

        await expect(useCase.execute('token', currentUser)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('lanza BadRequestException si el usuario actual está inactivo', async () => {
        jwtVerifyMock.mockReturnValue({ id: 'u1', type: 'refresh' });

        await expect(
            useCase.execute('token', { id: 'u1', isActive: false } as User),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si no encuentra al usuario en la base de datos', async () => {
        jwtVerifyMock.mockReturnValue({ id: 'u1', type: 'refresh' });
        findUserByTermMock.mockResolvedValue(null);

        await expect(useCase.execute('token', currentUser)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('retorna tokens nuevos y el usuario saneado cuando todo es válido', async () => {
        jwtVerifyMock.mockReturnValue({ id: 'u1', type: 'refresh' });
        findUserByTermMock.mockResolvedValue({
            id: 'u1',
            username: 'ana',
            isActive: true,
            role: 'ADMIN',
            name: 'Ana',
            lastname: 'García',
            userkey: 'secret-hash',
            branch: null,
            branches: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await useCase.execute('token', currentUser);

        expect(jwtSignMock).toHaveBeenNthCalledWith(1, {
            id: 'u1',
            type: 'access',
        });
        expect(jwtSignMock).toHaveBeenNthCalledWith(
            2,
            { id: 'u1', type: 'refresh' },
            { expiresIn: '7d' },
        );
        expect(result.user).not.toHaveProperty('userkey');
        expect(result.user).toEqual(
            expect.objectContaining({ id: 'u1', username: 'ana', role: 'ADMIN' }),
        );
    });
});
