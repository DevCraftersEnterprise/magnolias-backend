import { NotFoundException } from '@nestjs/common';
import { CreatePhoneForBranchUseCase } from './create-phone-for-branch.usecase';
import type { CreatePhonesDto } from '../../dto/create-phones.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const phoneRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve({ id: 'phone-1', ...entity })),
    };

    const useCase = new CreatePhoneForBranchUseCase(
        branchRepository as never,
        phoneRepository as never,
    );

    return { useCase, branchRepository, phoneRepository };
}

const user = { id: 'user-1' } as User;

function baseDto(overrides: Partial<CreatePhonesDto> = {}): CreatePhonesDto {
    return { phone1: '1234567890', ...overrides } as CreatePhonesDto;
}

describe('CreatePhoneForBranchUseCase', () => {
    it('lanza NotFoundException si la sucursal no existe', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(baseDto(), user, 'branch-1'),
        ).rejects.toThrow(NotFoundException);
        expect(mocks.phoneRepository.create).not.toHaveBeenCalled();
    });

    it('crea el teléfono asociado a la sucursal (vía Phone.branch) y registra updatedBy en la sucursal', async () => {
        const mocks = createMocks();
        const branch = { id: 'branch-1', phones: null, updatedBy: null };
        mocks.branchRepository.findOne.mockResolvedValue(branch);

        const result = await mocks.useCase.execute(baseDto(), user, 'branch-1');

        expect(mocks.phoneRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                phone1: '1234567890',
                branch,
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(result.id).toBe('phone-1');
        expect(mocks.branchRepository.update).toHaveBeenCalledWith('branch-1', {
            updatedBy: user,
        });
    });

    it('no usa save(branch) para registrar el updatedBy de la sucursal', async () => {
        // branch.phones queda cargado (eager) como null desde antes de crear
        // el teléfono. Si se usara branchRepository.save(branch) aquí, el
        // cascade:true de la relación interpretaría ese null como "quitar el
        // teléfono" y anularía el branchId del teléfono recién creado.
        const mocks = createMocks();
        const branch = { id: 'branch-1', phones: null, updatedBy: null };
        mocks.branchRepository.findOne.mockResolvedValue(branch);

        await mocks.useCase.execute(baseDto(), user, 'branch-1');

        expect(mocks.branchRepository.save).not.toHaveBeenCalled();
    });
});
