import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeePinThrottleGuard } from './employee-pin-throttle.guard';

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
        THROTTLE_PIN_LIMIT: maxAttempts,
        THROTTLE_TTL: windowSeconds,
    };

    return {
        get: jest.fn((key: string, defaultValue?: number) => values[key] ?? defaultValue),
    } as unknown as ConfigService;
}

describe('EmployeePinThrottleGuard', () => {
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
        const guard = new EmployeePinThrottleGuard(createConfigService(3, 60));

        expect(guard.canActivate(createContext(IP))).toBe(true);
    });

    it('bloquea el acceso al alcanzar el máximo de intentos fallidos dentro de la ventana', () => {
        const guard = new EmployeePinThrottleGuard(createConfigService(3, 60));

        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);
        currentTime += 1000;
        guard.recordFailedAttempt(IP);

        expect(() => guard.canActivate(createContext(IP))).toThrow(
            BadRequestException,
        );
    });

    it('clearFailedAttempts limpia el registro tras un PIN correcto', () => {
        const guard = new EmployeePinThrottleGuard(createConfigService(2, 60));

        guard.recordFailedAttempt(IP);
        guard.clearFailedAttempts(IP);
        guard.recordFailedAttempt(IP);

        expect(guard.canActivate(createContext(IP))).toBe(true);
    });

    it('trata cada IP de forma independiente', () => {
        const guard = new EmployeePinThrottleGuard(createConfigService(1, 60));

        guard.recordFailedAttempt('1.1.1.1');

        expect(() => guard.canActivate(createContext('1.1.1.1'))).toThrow(
            BadRequestException,
        );
        expect(guard.canActivate(createContext('2.2.2.2'))).toBe(true);
    });
});
