import { NotFoundException } from '@nestjs/common';
import { FindOneCommonAddressUseCase } from './find-one-common-address.usecase';

function createMocks() {
    const commonAddressRepository = {
        findOne: jest.fn(),
    };

    const useCase = new FindOneCommonAddressUseCase(
        commonAddressRepository as never,
    );

    return { useCase, commonAddressRepository };
}

describe('FindOneCommonAddressUseCase', () => {
    it('lanza NotFoundException si la dirección no existe', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('id-1')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('busca solo direcciones activas por id', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue({ id: 'id-1' });

        await mocks.useCase.execute('id-1');

        expect(mocks.commonAddressRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'id-1', isActive: true },
        });
    });

    it('retorna la dirección encontrada', async () => {
        const mocks = createMocks();
        const address = { id: 'id-1', street: 'Calle X' };
        mocks.commonAddressRepository.findOne.mockResolvedValue(address);

        const result = await mocks.useCase.execute('id-1');

        expect(result).toBe(address);
    });
});
