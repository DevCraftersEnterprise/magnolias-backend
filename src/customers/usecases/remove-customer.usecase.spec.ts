import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveCustomerUseCase } from './remove-customer.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const customerRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new RemoveCustomerUseCase(customerRepository as never);

    return { useCase, customerRepository };
}

const user = { id: 'user-1' } as User;

describe('RemoveCustomerUseCase', () => {
    it('lanza NotFoundException si el cliente no existe', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('id-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('lanza BadRequestException si el cliente ya está inactivo', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue({
            id: 'id-1',
            isActive: false,
        });

        await expect(mocks.useCase.execute('id-1', user)).rejects.toThrow(
            BadRequestException,
        );
        expect(mocks.customerRepository.save).not.toHaveBeenCalled();
    });

    it('marca isActive=false y registra updatedBy al eliminar (soft delete)', async () => {
        const mocks = createMocks();
        const customer = { id: 'id-1', isActive: true, updatedBy: null };
        mocks.customerRepository.findOne.mockResolvedValue(customer);

        await mocks.useCase.execute('id-1', user);

        expect(customer.isActive).toBe(false);
        expect(customer.updatedBy).toBe(user);
        expect(mocks.customerRepository.save).toHaveBeenCalledWith(customer);
    });
});
