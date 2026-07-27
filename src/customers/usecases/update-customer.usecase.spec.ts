import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateCustomerUseCase } from './update-customer.usecase';
import type { UpdateCustomerDto } from '../dto/update-customer.dto';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const customerRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const customerAddressRepository = {
        findOne: jest.fn(),
        create: jest.fn((data) => ({ ...data })),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new UpdateCustomerUseCase(
        customerRepository as never,
        customerAddressRepository as never,
    );

    return { useCase, customerRepository, customerAddressRepository };
}

const user = { id: 'user-1' } as User;

function baseCustomer(overrides: Record<string, unknown> = {}) {
    return {
        id: 'id-1',
        fullName: 'Juan Pérez',
        phone: '5512345678',
        ...overrides,
    };
}

describe('UpdateCustomerUseCase', () => {
    it('lanza NotFoundException si el cliente no existe', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('id-1', {} as UpdateCustomerDto, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si otro cliente ya usa el nuevo teléfono', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne
            .mockResolvedValueOnce(baseCustomer())
            .mockResolvedValueOnce({ id: 'otro-cliente', phone: '5599999999' });

        await expect(
            mocks.useCase.execute(
                'id-1',
                { phone: '5599999999' } as UpdateCustomerDto,
                user,
            ),
        ).rejects.toThrow(ConflictException);
    });

    it('no lanza conflicto si el "duplicado" encontrado es el mismo cliente', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne
            .mockResolvedValueOnce(baseCustomer())
            .mockResolvedValueOnce({ id: 'id-1', phone: '5599999999' });

        await expect(
            mocks.useCase.execute(
                'id-1',
                { phone: '5599999999' } as UpdateCustomerDto,
                user,
            ),
        ).resolves.toBeDefined();
    });

    it('no consulta duplicados si el teléfono no cambia', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValueOnce(baseCustomer());

        await mocks.useCase.execute(
            'id-1',
            { phone: '5512345678' } as UpdateCustomerDto,
            user,
        );

        expect(mocks.customerRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('actualiza los campos del cliente y updatedBy', async () => {
        const mocks = createMocks();
        const customer = baseCustomer();
        mocks.customerRepository.findOne.mockResolvedValueOnce(customer);

        const result = await mocks.useCase.execute(
            'id-1',
            { fullName: 'Nuevo Nombre' } as UpdateCustomerDto,
            user,
        );

        expect(result.fullName).toBe('Nuevo Nombre');
        expect(mocks.customerRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ updatedBy: user }),
        );
    });

    it('crea una nueva dirección si el cliente no tenía una', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValueOnce(baseCustomer());
        mocks.customerAddressRepository.findOne.mockResolvedValue(null);

        await mocks.useCase.execute(
            'id-1',
            { address: { street: 'Calle Nueva' } as never } as UpdateCustomerDto,
            user,
        );

        expect(mocks.customerAddressRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                street: 'Calle Nueva',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(mocks.customerAddressRepository.save).toHaveBeenCalled();
    });

    it('actualiza in-place la dirección existente sin tocar createdBy', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValueOnce(baseCustomer());
        const existingAddress = {
            id: 'addr-1',
            street: 'Calle Vieja',
            createdBy: { id: 'old-user' },
        };
        mocks.customerAddressRepository.findOne.mockResolvedValue(existingAddress);

        await mocks.useCase.execute(
            'id-1',
            { address: { street: 'Calle Nueva' } as never } as UpdateCustomerDto,
            user,
        );

        expect(mocks.customerAddressRepository.create).not.toHaveBeenCalled();
        expect(existingAddress.street).toBe('Calle Nueva');
        expect(existingAddress.createdBy).toEqual({ id: 'old-user' });
        expect(mocks.customerAddressRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ updatedBy: user }),
        );
    });
});
