import { NotFoundException } from '@nestjs/common';
import { RemoveBranchEmployeeUseCase } from './remove-branch-employee.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const branchEmployeeRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new RemoveBranchEmployeeUseCase(
        branchEmployeeRepository as never,
    );

    return { useCase, branchEmployeeRepository };
}

const user = { id: 'admin-1' } as User;

describe('RemoveBranchEmployeeUseCase', () => {
    it('lanza NotFoundException si el empleado no existe', async () => {
        const mocks = createMocks();
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('employee-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('desactiva al empleado y registra quién lo hizo', async () => {
        const mocks = createMocks();
        const employee = { id: 'employee-1', isActive: true };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);

        await mocks.useCase.execute('employee-1', user);

        expect(mocks.branchEmployeeRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ isActive: false, updatedBy: user }),
        );
    });

    it('no hace nada (idempotente) si ya estaba desactivado', async () => {
        const mocks = createMocks();
        const employee = { id: 'employee-1', isActive: false };
        mocks.branchEmployeeRepository.findOne.mockResolvedValue(employee);

        await mocks.useCase.execute('employee-1', user);

        expect(mocks.branchEmployeeRepository.save).not.toHaveBeenCalled();
    });
});
