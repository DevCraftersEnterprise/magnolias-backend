import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLER_SKIP } from '@nestjs/throttler/dist/throttler.constants';
import { AuthController } from './auth.controller';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

function getHandler(
    methodName: keyof AuthController,
): (...args: unknown[]) => unknown {
    return Object.getOwnPropertyDescriptor(AuthController.prototype, methodName)!
        .value as (...args: unknown[]) => unknown;
}

describe('AuthController - wiring de throttling en refresh-token', () => {
    it('aplica ThrottlerGuard junto a RefreshTokenGuard en refresh-token', () => {
        const guards = Reflect.getMetadata(
            GUARDS_METADATA,
            getHandler('refreshToken'),
        );

        expect(guards).toContain(ThrottlerGuard);
        expect(guards).toContain(RefreshTokenGuard);
    });

    it('excluye el bucket "login" en refresh-token', () => {
        const skipLogin = Reflect.getMetadata(
            THROTTLER_SKIP + 'login',
            getHandler('refreshToken'),
        );

        expect(skipLogin).toBe(true);
    });

    it('no agrega ThrottlerGuard a login() ni a validate-token', () => {
        const loginGuards = Reflect.getMetadata(GUARDS_METADATA, getHandler('login'));
        const validateGuards = Reflect.getMetadata(
            GUARDS_METADATA,
            getHandler('validateToken'),
        );

        expect(loginGuards ?? []).not.toContain(ThrottlerGuard);
        expect(validateGuards ?? []).not.toContain(ThrottlerGuard);
    });
});
