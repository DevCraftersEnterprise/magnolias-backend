import { NotFoundException } from '@nestjs/common';
import { CreatePhoneForBranchUseCase } from './create-phone-for-branch.usecase';
import type { CreatePhonesDto } from '../../dto/create-phones.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const branchRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
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
        expect(branch.updatedBy).toBe(user);
        expect(mocks.branchRepository.save).toHaveBeenCalledWith(branch);
    });

});
