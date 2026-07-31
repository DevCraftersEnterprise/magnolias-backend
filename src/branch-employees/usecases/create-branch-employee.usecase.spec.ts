import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateBranchEmployeeUseCase } from './create-branch-employee.usecase';
import type { User } from '../../users/entities/user.entity';
import type { CreateBranchEmployeeDto } from '../dto/create-branch-employee.dto';

function createMocks() {
    const branchEmployeeRepository = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve({ id: 'employee-1', ...entity })),
    };
    const branchesService = { findBranchByTerm: jest.fn() };

    const useCase = new CreateBranchEmployeeUseCase(
        branchEmployeeRepository as never,
        branchesService as never,
    );

    return { useCase, branchEmployeeRepository, branchesService };
}

const user = { id: 'admin-1' } as User;
const branch = { id: 'branch-1', name: 'Centro' };

function baseDto(
    overrides: Partial<CreateBranchEmployeeDto> = {},
): CreateBranchEmployeeDto {
    return {
        name: 'María',
        lastname: 'García',
        pin: '4821',
        branchId: 'branch-1',
        ...overrides,
    } as CreateBranchEmployeeDto;
}

describe('CreateBranchEmployeeUseCase', () => {
    it('lanza lo que BranchesService lance si la sucursal no existe', async () => {
        const mocks = createMocks();
        mocks.branchesService.findBranchByTerm.mockRejectedValue(
            new Error('Branch not found'),
        );

        await expect(mocks.useCase.execute(baseDto(), user)).rejects.toThrow(
            'Branch not found',
        );
    });

    it('lanza ConflictException si el PIN ya está en uso en la sucursal', async () => {
        const mocks = createMocks();
        mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
        const existingHashedPin = await argon2.hash('4821');
        mocks.branchEmployeeRepository.find.mockResolvedValue([
            { id: 'other-employee', pin: existingHashedPin },
        ]);

        await expect(
            mocks.useCase.execute(baseDto({ pin: '4821' }), user),
        ).rejects.toThrow(ConflictException);
    });

    it('crea el empleado con el PIN hasheado cuando no hay conflicto', async () => {
        const mocks = createMocks();
        mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);

        const result = await mocks.useCase.execute(baseDto(), user);

        const createdArg = mocks.branchEmployeeRepository.create.mock.calls[0][0];
        expect(createdArg.pin).not.toBe('4821');
        expect(await argon2.verify(createdArg.pin, '4821')).toBe(true);
        expect(createdArg.createdBy).toBe(user);
        expect(createdArg.updatedBy).toBe(user);
        expect(result.id).toBe('employee-1');
    });

    it('permite el mismo PIN en sucursales distintas', async () => {
        const mocks = createMocks();
        mocks.branchesService.findBranchByTerm.mockResolvedValue(branch);
        mocks.branchEmployeeRepository.find.mockResolvedValue([]); // scoped to branch-1, empty

        await expect(
            mocks.useCase.execute(baseDto({ pin: '4821' }), user),
        ).resolves.toBeDefined();
    });
});
