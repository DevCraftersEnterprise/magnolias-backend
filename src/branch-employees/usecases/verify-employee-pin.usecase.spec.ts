import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { VerifyEmployeePinUseCase } from './verify-employee-pin.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const branchEmployeeRepository = {
        find: jest.fn().mockResolvedValue([]),
    };
    const jwtService = {
        sign: jest.fn().mockReturnValue('signed-token'),
    };
    const configService = {
        get: jest.fn((key: string) =>
            key === 'EMPLOYEE_ACTION_TOKEN_EXPIRY' ? '5m' : undefined,
        ),
    };

    const useCase = new VerifyEmployeePinUseCase(
        branchEmployeeRepository as never,
        jwtService as never,
        configService as never,
    );

    return { useCase, branchEmployeeRepository, jwtService, configService };
}

describe('VerifyEmployeePinUseCase', () => {
    it('lanza BadRequestException si el usuario de sesión no tiene sucursal', async () => {
        const mocks = createMocks();
        const user = { id: 'user-1', branch: null } as unknown as User;

        await expect(
            mocks.useCase.execute({ pin: '4821' }, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si ningún empleado activo coincide con el PIN', async () => {
        const mocks = createMocks();
        const user = { id: 'user-1', branch: { id: 'branch-1' } } as User;
        const hashedPin = await argon2.hash('1111');
        mocks.branchEmployeeRepository.find.mockResolvedValue([
            { id: 'employee-1', name: 'María', lastname: 'García', pin: hashedPin },
        ]);

        await expect(
            mocks.useCase.execute({ pin: '9999' }, user),
        ).rejects.toThrow(BadRequestException);
    });

    it('identifica al empleado y firma un token con type employee-action', async () => {
        const mocks = createMocks();
        const user = { id: 'user-1', branch: { id: 'branch-1' } } as User;
        const hashedPin = await argon2.hash('4821');
        mocks.branchEmployeeRepository.find.mockResolvedValue([
            { id: 'employee-1', name: 'María', lastname: 'García', pin: hashedPin },
        ]);

        const result = await mocks.useCase.execute({ pin: '4821' }, user);

        expect(mocks.jwtService.sign).toHaveBeenCalledWith(
            { employeeId: 'employee-1', branchId: 'branch-1', type: 'employee-action' },
            { expiresIn: '5m' },
        );
        expect(result.employeeActionToken).toBe('signed-token');
        expect(result.employeeName).toBe('María García');
    });

    it('solo busca empleados activos de la sucursal del usuario de sesión', async () => {
        const mocks = createMocks();
        const user = { id: 'user-1', branch: { id: 'branch-1' } } as User;

        await expect(
            mocks.useCase.execute({ pin: '4821' }, user),
        ).rejects.toThrow(BadRequestException);

        expect(mocks.branchEmployeeRepository.find).toHaveBeenCalledWith({
            where: { branch: { id: 'branch-1' }, isActive: true },
        });
    });
});
