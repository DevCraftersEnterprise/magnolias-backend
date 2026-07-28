import { NotFoundException } from '@nestjs/common';
import { UpdatePhoneForBranchUseCase } from './update-phone-for-branch.usecase';
import type { UpdatePhonesDto } from '../../dto/update-phones.dto';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const phoneRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new UpdatePhoneForBranchUseCase(phoneRepository as never);

    return { useCase, phoneRepository };
}

const user = { id: 'user-1' } as User;

describe('UpdatePhoneForBranchUseCase', () => {
    it('lanza NotFoundException si el teléfono no existe', async () => {
        const mocks = createMocks();
        mocks.phoneRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute(
                { id: 'phone-1', phone1: '1112223333' } as UpdatePhonesDto,
                user,
            ),
        ).rejects.toThrow(NotFoundException);
    });

    it('actualiza los campos del teléfono y registra updatedBy', async () => {
        const mocks = createMocks();
        const phone = { id: 'phone-1', phone1: '0000000000', updatedBy: null };
        mocks.phoneRepository.findOne.mockResolvedValue(phone);

        const result = await mocks.useCase.execute(
            { id: 'phone-1', phone1: '1112223333' } as UpdatePhonesDto,
            user,
        );

        expect(result.phone1).toBe('1112223333');
        expect(result.updatedBy).toBe(user);
        expect(mocks.phoneRepository.save).toHaveBeenCalledWith(phone);
    });
});
