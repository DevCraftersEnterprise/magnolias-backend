import { CreateBranchUseCase } from './create-branch.usecase';
import type { CreateBranchDto } from '../../dto/create-branch.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new CreateBranchUseCase(branchRepository as never);

    return { useCase, branchRepository };
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
    it('crea la sucursal con createdBy/updatedBy', async () => {
        const mocks = createMocks();

        const result = await mocks.useCase.execute(baseDto(), user);

        expect(mocks.branchRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Sucursal Centro',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(result.name).toBe('Sucursal Centro');
    });

    it('propaga el locationUrl del DTO al crear la sucursal', async () => {
        const mocks = createMocks();
        const locationUrl = 'https://www.google.com/maps/embed?pb=123';

        const result = await mocks.useCase.execute(
            baseDto({ locationUrl }),
            user,
        );

        expect(mocks.branchRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ locationUrl }),
        );
        expect(result.locationUrl).toBe(locationUrl);
    });

    it('no requiere locationUrl para crear la sucursal', async () => {
        const mocks = createMocks();

        const result = await mocks.useCase.execute(baseDto(), user);

        expect(result.locationUrl).toBeUndefined();
    });
});
