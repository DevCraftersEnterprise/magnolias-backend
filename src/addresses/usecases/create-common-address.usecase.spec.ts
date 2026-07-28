import { ConflictException } from '@nestjs/common';
import { CreateCommonAddressUseCase } from './create-common-address.usecase';
import type { CreateCommonAddressDto } from '../dto/create-common-address.dto';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const commonAddressRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const checkForDuplicateAddressUtil = {
        checkForDuplicate: jest.fn(),
    };

    const useCase = new CreateCommonAddressUseCase(
        commonAddressRepository as never,
        checkForDuplicateAddressUtil as never,
    );

    return { useCase, commonAddressRepository, checkForDuplicateAddressUtil };
}

const user = { id: 'user-1' } as User;

function baseDto(overrides: Partial<CreateCommonAddressDto> = {}): CreateCommonAddressDto {
    return {
        name: 'Salón La Estancia',
        street: 'Av. Insurgentes Sur',
        number: '123-A',
        neighborhood: 'Roma',
        ...overrides,
    } as CreateCommonAddressDto;
}

describe('CreateCommonAddressUseCase', () => {
    it('lanza ConflictException si ya existe una dirección con la misma calle/número/colonia', async () => {
        const mocks = createMocks();
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue({
            id: 'existing-1',
        });

        await expect(mocks.useCase.execute(baseDto(), user)).rejects.toThrow(
            ConflictException,
        );
        expect(mocks.commonAddressRepository.create).not.toHaveBeenCalled();
        expect(mocks.commonAddressRepository.save).not.toHaveBeenCalled();
    });

    it('busca duplicados usando street/number/neighborhood del DTO', async () => {
        const mocks = createMocks();
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue(null);

        await mocks.useCase.execute(
            baseDto({ street: 'Calle X', number: '10', neighborhood: 'Centro' }),
            user,
        );

        expect(
            mocks.checkForDuplicateAddressUtil.checkForDuplicate,
        ).toHaveBeenCalledWith('Calle X', '10', 'Centro');
    });

    it('crea y guarda la dirección con createdBy y updatedBy cuando no hay duplicado', async () => {
        const mocks = createMocks();
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue(null);

        const result = await mocks.useCase.execute(baseDto(), user);

        expect(mocks.commonAddressRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Salón La Estancia',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(mocks.commonAddressRepository.save).toHaveBeenCalled();
        expect(result).toEqual(
            expect.objectContaining({ createdBy: user, updatedBy: user }),
        );
    });
});
