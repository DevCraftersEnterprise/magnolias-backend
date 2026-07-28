import { NotFoundException } from '@nestjs/common';
import { UpdateBranchUseCase } from './update-branch.usecase';
import type { UpdateBranchDto } from '../../dto/update-branch.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const geocodingService = {
        geocodeAddress: jest.fn(),
    };

    const useCase = new UpdateBranchUseCase(
        branchRepository as never,
        geocodingService as never,
    );

    return { useCase, branchRepository, geocodingService };
}

const user = { id: 'user-1' } as User;

function baseBranch(overrides: Record<string, unknown> = {}) {
    return {
        id: 'b1',
        name: 'Sucursal Vieja',
        address: 'Calle Vieja 1',
        latitude: 10,
        longitude: 20,
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

    it('no vuelve a geocodificar si el DTO no trae address', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(baseBranch());

        await mocks.useCase.execute(
            { id: 'b1', name: 'Nuevo nombre' } as UpdateBranchDto,
            user,
        );

        expect(mocks.geocodingService.geocodeAddress).not.toHaveBeenCalled();
    });

    it('geocodifica y actualiza lat/lng si el DTO trae address y el geocoder resuelve', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(baseBranch());
        mocks.geocodingService.geocodeAddress.mockResolvedValue({
            latitude: 99,
            longitude: -99,
        });

        const result = await mocks.useCase.execute(
            { id: 'b1', address: 'Nueva Calle 2' } as UpdateBranchDto,
            user,
        );

        expect(mocks.geocodingService.geocodeAddress).toHaveBeenCalledWith(
            'Nueva Calle 2',
        );
        expect(result.latitude).toBe(99);
        expect(result.longitude).toBe(-99);
    });

    it('conserva las coordenadas previas si el geocoder retorna null', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(baseBranch());
        mocks.geocodingService.geocodeAddress.mockResolvedValue(null);

        const result = await mocks.useCase.execute(
            { id: 'b1', address: 'Dirección rara' } as UpdateBranchDto,
            user,
        );

        expect(result.latitude).toBe(10);
        expect(result.longitude).toBe(20);
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
});
