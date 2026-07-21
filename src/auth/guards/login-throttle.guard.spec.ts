import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginThrottleGuard } from './login-throttle.guard';

function createContext(ip: string): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ ip, connection: { remoteAddress: ip } }),
        }),
    } as unknown as ExecutionContext;
}

function createConfigService(
    maxAttempts: number,
    windowSeconds: number,
): ConfigService {
    const values: Record<string, number> = {
        THROTTLE_LOGIN_LIMIT: maxAttempts,
        THROTTLE_TTL: windowSeconds,
    };

    return {
        get: jest.fn((key: string, defaultValue?: number) => values[key] ?? defaultValue),
    } as unknown as ConfigService;
}

describe('LoginThrottleGuard', () => {
    const IP = '10.0.0.1';
    let currentTime: number;
    let nowSpy: jest.SpyInstance<number, []>;

    beforeEach(() => {
        currentTime = 1_700_000_000_000;
        nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    });

    afterEach(() => {
        nowSpy.mockRestore();
    });

    it('permite el acceso cuando no hay intentos previos', () => {
        const guard = new LoginThrottleGuard(createConfigService(3, 60));

        expect(guard.canActivate(createContext(IP))).toBe(true);
    });

    it('permite el acceso mientras los intentos fallidos no alcanzan el máximo', () => {
        const guard = new LoginThrottleGuard(createConfigService(3, 60));

        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);

        expect(guard.canActivate(createContext(IP))).toBe(true);
    });

    it('bloquea el acceso al alcanzar el máximo de intentos fallidos dentro de la ventana', () => {
        const guard = new LoginThrottleGuard(createConfigService(3, 60));

        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);

        expect(() => guard.canActivate(createContext(IP))).toThrow(BadRequestException);
    });

    it('regresión: no debe resetear los intentos mientras la ventana sigue vigente', () => {
        const guard = new LoginThrottleGuard(createConfigService(2, 60));

        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);
        currentTime += 1000;

        // Antes del fix, esta llamada borraba los intentos porque
        // "now - firstAttempt < windowMs" se cumplía y el bloqueo nunca se disparaba.
        expect(() => guard.canActivate(createContext(IP))).toThrow(BadRequestException);
    });

    it('permite el acceso de nuevo una vez que la ventana expiró', () => {
        const guard = new LoginThrottleGuard(createConfigService(2, 60));

        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);

        currentTime += 61_000; // ventana de 60s ya expiró

        expect(guard.canActivate(createContext(IP))).toBe(true);
    });

    it('clearFailedAttempts limpia el registro tras un login exitoso', () => {
        const guard = new LoginThrottleGuard(createConfigService(2, 60));

        guard.recordFailedAttempt(IP);
        guard.clearFailedAttempts(IP);
        guard.recordFailedAttempt(IP);

        expect(guard.canActivate(createContext(IP))).toBe(true);
    });

    it('trata cada IP de forma independiente', () => {
        const guard = new LoginThrottleGuard(createConfigService(1, 60));

        guard.recordFailedAttempt('1.1.1.1');

        expect(() => guard.canActivate(createContext('1.1.1.1'))).toThrow(
            BadRequestException,
        );
        expect(guard.canActivate(createContext('2.2.2.2'))).toBe(true);
    });
});