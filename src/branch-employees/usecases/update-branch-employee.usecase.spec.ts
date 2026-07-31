import { ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UpdateBranchEmployeeUseCase } from './update-branch-employee.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const branchEmployeeRepository = {
        findOne: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new UpdateBranchEmployeeUseCase(
        branchEmployeeRepository as never,
    );

    return { useCase, branchEmployeeRepository };
}

const user = { id: 'admin-1' } as User;

describe('UpdateBranchEmployeeUseCase', () => {
    it('lanza NotFoundException si el empleado no existe', async () => {
        const mocks = createMocks();
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('employee-1', { name: 'Nuevo' }, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('actualiza nombre/lastname sin tocar el PIN si no se envía', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            name: 'María',
            lastname: 'García',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);

        const result = await mocks.useCase.execute(
            'employee-1',
            { name: 'Mariana' },
            user,
        );

        expect(result.name).toBe('Mariana');
        expect(result.pin).toBe('old-hash');
        expect(result.updatedBy).toBe(user);
    });

    it('lanza ConflictException si el nuevo PIN ya está en uso por otro empleado activo', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);
        const otherHashedPin = await argon2.hash('9999');
        mocks.branchEmployeeRepository.find.mockResolvedValue([
            { id: 'other-employee', pin: otherHashedPin },
        ]);

        await expect(
            mocks.useCase.execute('employee-1', { pin: '9999' }, user),
        ).rejects.toThrow(ConflictException);
    });

    it('permite reutilizar su propio PIN actual (no se compara contra sí mismo)', async () => {
        const mocks = createMocks();
        const ownHashedPin = await argon2.hash('4821');
        const employee = {
            id: 'employee-1',
            pin: ownHashedPin,
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);
        mocks.branchEmployeeRepository.find.mockResolvedValue([employee]);

        await expect(
            mocks.useCase.execute('employee-1', { pin: '4821' }, user),
        ).resolves.toBeDefined();
    });

    it('hashea el nuevo PIN cuando no hay conflicto', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);
        mocks.branchEmployeeRepository.find.mockResolvedValue([]);

        const result = await mocks.useCase.execute(
            'employee-1',
            { pin: '1357' },
            user,
        );

        expect(result.pin).not.toBe('old-hash');
        expect(await argon2.verify(result.pin, '1357')).toBe(true);
    });

    it('permite desactivar al empleado (isActive=false)', async () => {
        const mocks = createMocks();
        const employee = {
            id: 'employee-1',
            pin: 'old-hash',
            branch: { id: 'branch-1' },
            isActive: true,
        };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);

        const result = await mocks.useCase.execute(
            'employee-1',
            { isActive: false },
            user,
        );

        expect(result.isActive).toBe(false);
    });
});
