import { CreateBranchUseCase } from './create-branch.usecase';
import type { CreateBranchDto } from '../../dto/create-branch.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const geocodingService = {
        geocodeAddress: jest.fn(),
    };

    const useCase = new CreateBranchUseCase(
        branchRepository as never,
        geocodingService as never,
    );

    return { useCase, branchRepository, geocodingService };
}

const user = { id: 'user-1' } as User;

function baseDto(overrides: Partial<CreateBranchDto> = {}): CreateBranchDto {
    return {
        name: 'Sucursal Centro',
        address: 'Av. Siempre Viva 123',
        ...overrides,
    } as CreateBranchDto;
}

describe('CreateBranchUseCase', () => {
    it('crea la sucursal con createdBy/updatedBy y asigna coordenadas si el geocoder resuelve', async () => {
        const mocks = createMocks();
        mocks.geocodingService.geocodeAddress.mockResolvedValue({
            latitude: 21.88,
            longitude: -102.29,
        });

        const result = await mocks.useCase.execute(baseDto(), user);

        expect(mocks.branchRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Sucursal Centro',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(result.latitude).toBe(21.88);
        expect(result.longitude).toBe(-102.29);
    });

    it('no asigna coordenadas si el geocoder retorna null', async () => {
        const mocks = createMocks();
        mocks.geocodingService.geocodeAddress.mockResolvedValue(null);

        const result = await mocks.useCase.execute(baseDto(), user);

        expect(result.latitude).toBeUndefined();
        expect(result.longitude).toBeUndefined();
    });

    it('llama al geocoder con la dirección del DTO', async () => {
        const mocks = createMocks();
        mocks.geocodingService.geocodeAddress.mockResolvedValue(null);

        await mocks.useCase.execute(
            baseDto({ address: 'Calle Falsa 456' }),
            user,
        );

        expect(mocks.geocodingService.geocodeAddress).toHaveBeenCalledWith(
            'Calle Falsa 456',
        );
    });
});
