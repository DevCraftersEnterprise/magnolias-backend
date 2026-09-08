import { NotFoundException } from '@nestjs/common';
import { UpdateBranchUseCase } from './update-branch.usecase';
import type { UpdateBranchDto } from '../../dto/update-branch.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new UpdateBranchUseCase(branchRepository as never);

    return { useCase, branchRepository };
}

const user = { id: 'user-1' } as User;

function baseBranch(overrides: Record<string, unknown> = {}) {
    return {
        id: 'b1',
        name: 'Sucursal Vieja',
        address: 'Calle Vieja 1',
        locationUrl: 'https://www.google.com/maps/embed?pb=old',
        ...overrides,
    };
}

describe('UpdateBranchUseCase', () => {
    it('lanza NotFoundException si la sucursal no existe', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute({ id: 'b1' } as UpdateBranchDto, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('aplica los campos del DTO y registra updatedBy', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(baseBranch());

        const result = await mocks.useCase.execute(
            { id: 'b1', name: 'Nuevo nombre' } as UpdateBranchDto,
            user,
        );

        expect(result.name).toBe('Nuevo nombre');
        expect(mocks.branchRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ updatedBy: user }),
        );
    });

    it('actualiza el locationUrl si el DTO lo incluye', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(baseBranch());
        const locationUrl = 'https://www.google.com/maps/embed?pb=new';

        const result = await mocks.useCase.execute(
            { id: 'b1', locationUrl } as UpdateBranchDto,
            user,
        );

        expect(result.locationUrl).toBe(locationUrl);
    });

    it('conserva el locationUrl previo si el DTO no lo incluye', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(baseBranch());

        const result = await mocks.useCase.execute(
            { id: 'b1', name: 'Nuevo nombre' } as UpdateBranchDto,
            user,
        );

        expect(result.locationUrl).toBe(
            'https://www.google.com/maps/embed?pb=old',
        );
    });
});
