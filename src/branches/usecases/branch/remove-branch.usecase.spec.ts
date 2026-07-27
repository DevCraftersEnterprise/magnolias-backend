import { NotFoundException } from '@nestjs/common';
import { RemoveBranchUseCase } from './remove-branch.usecase';
import type { UpdateBranchDto } from '../../dto/update-branch.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new RemoveBranchUseCase(branchRepository as never);

    return { useCase, branchRepository };
}

const user = { id: 'user-1' } as User;

describe('RemoveBranchUseCase', () => {
    it('lanza NotFoundException si la sucursal no existe o ya está inactiva', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute({ id: 'b1' } as UpdateBranchDto, user),
        ).rejects.toThrow(NotFoundException);

        expect(mocks.branchRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'b1', isActive: true },
        });
    });

    it('marca isActive=false y registra updatedBy al eliminar (soft delete)', async () => {
        const mocks = createMocks();
        const branch = { id: 'b1', isActive: true, updatedBy: null };
        mocks.branchRepository.findOne.mockResolvedValue(branch);

        await mocks.useCase.execute({ id: 'b1' } as UpdateBranchDto, user);

        expect(branch.isActive).toBe(false);
        expect(branch.updatedBy).toBe(user);
        expect(mocks.branchRepository.save).toHaveBeenCalledWith(branch);
    });
});
