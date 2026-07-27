import { NotFoundException } from '@nestjs/common';
import { RemoveCommonAddressUseCase } from './remove-common-address.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const commonAddressRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new RemoveCommonAddressUseCase(
        commonAddressRepository as never,
    );

    return { useCase, commonAddressRepository };
}

const user = { id: 'user-1' } as User;

describe('RemoveCommonAddressUseCase', () => {
    it('lanza NotFoundException si la dirección no existe', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('id-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('marca isActive=false y registra updatedBy al eliminar (soft delete)', async () => {
        const mocks = createMocks();
        const address = { id: 'id-1', isActive: true, updatedBy: null };
        mocks.commonAddressRepository.findOne.mockResolvedValue(address);

        await mocks.useCase.execute('id-1', user);

        expect(address.isActive).toBe(false);
        expect(address.updatedBy).toBe(user);
        expect(mocks.commonAddressRepository.save).toHaveBeenCalledWith(address);
    });

    it('busca la dirección por id sin filtrar por isActive', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue({ id: 'id-1' });

        await mocks.useCase.execute('id-1', user);

        expect(mocks.commonAddressRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'id-1' },
        });
    });
});
