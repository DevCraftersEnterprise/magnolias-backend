import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RegenerateBranchEmployeePinUseCase } from './regenerate-branch-employee-pin.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const branchEmployeeRepository = {
        findOne: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new RegenerateBranchEmployeePinUseCase(
        branchEmployeeRepository as never,
    );

    return { useCase, branchEmployeeRepository };
}

const user = { id: 'admin-1' } as User;

describe('RegenerateBranchEmployeePinUseCase', () => {
    it('lanza NotFoundException si el empleado no existe', async () => {
        const mocks = createMocks();
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('employee-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('genera y guarda un nuevo PIN hasheado, distinto del anterior', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);

        const result = await mocks.useCase.execute('employee-1', user);

        expect(result.pin).toMatch(/^\d{4}$/);
        expect(employee.pin).not.toBe('old-hash');
        expect(await argon2.verify(employee.pin, result.pin)).toBe(true);
        expect(mocks.branchEmployeeRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ updatedBy: user }),
        );
    });

    it('reintenta si el PIN generado ya está en uso, hasta encontrar uno libre', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);
        // Simula que el primer PIN generado colisiona, el segundo no.
        mocks.branchEmployeeRepository.find
            .mockResolvedValueOnce([{ id: 'other', pin: await argon2.hash('0000') }])
            .mockResolvedValue([]);

        const result = await mocks.useCase.execute('employee-1', user);

        expect(result.pin).toMatch(/^\d{4}$/);
    });

    it('lanza InternalServerErrorException si no logra un PIN único tras los intentos máximos', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);
        mocks.branchEmployeeRepository.find.mockResolvedValue([
            { id: 'other', pin: 'some-hash' },
        ]);
        // Cada intento encuentra una colisión falsa forzando el agotamiento de intentos.
        const verifySpy = jest
            .spyOn(argon2, 'verify')
            .mockResolvedValue(true as never);

        await expect(
            mocks.useCase.execute('employee-1', user),
        ).rejects.toThrow(InternalServerErrorException);

        verifySpy.mockRestore();
    });
});
