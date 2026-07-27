import { ConflictException } from '@nestjs/common';
import { CreateCustomerUseCase } from './create-customer.usecase';
import type { CreateCustomerDto } from '../dto/create-customer.dto';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const customerRepository = {
        findOne: jest.fn(),
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve({ id: 'customer-1', ...entity })),
    };
    const customerAddressRepository = {
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new CreateCustomerUseCase(
        customerRepository as never,
        customerAddressRepository as never,
    );

    return { useCase, customerRepository, customerAddressRepository };
}

const user = { id: 'user-1' } as User;

function baseDto(overrides: Partial<CreateCustomerDto> = {}): CreateCustomerDto {
    return {
        fullName: 'Juan Pérez',
        phone: '5512345678',
        ...overrides,
    } as CreateCustomerDto;
}

describe('CreateCustomerUseCase', () => {
    it('lanza ConflictException si ya existe un cliente con el mismo teléfono', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue({ id: 'existing-1' });

        await expect(mocks.useCase.execute(baseDto(), user)).rejects.toThrow(
            ConflictException,
        );
        expect(mocks.customerRepository.create).not.toHaveBeenCalled();
    });

    it('crea el cliente con createdBy/updatedBy y no crea dirección si el DTO no la trae', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue(null);

        const result = await mocks.useCase.execute(baseDto(), user);

        expect(mocks.customerRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                fullName: 'Juan Pérez',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(mocks.customerAddressRepository.create).not.toHaveBeenCalled();
        expect(result.id).toBe('customer-1');
    });

    it('crea también la dirección cuando el DTO trae address', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue(null);

        await mocks.useCase.execute(
            baseDto({
                address: { street: 'Calle X', number: '1', neighborhood: 'Centro' } as never,
            }),
            user,
        );

        expect(mocks.customerAddressRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                street: 'Calle X',
                customer: expect.objectContaining({ id: 'customer-1' }),
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(mocks.customerAddressRepository.save).toHaveBeenCalled();
    });
});
