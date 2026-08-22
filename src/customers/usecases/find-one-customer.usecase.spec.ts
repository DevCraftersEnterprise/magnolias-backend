import { NotFoundException } from '@nestjs/common';
import { FindOneCustomerUseCase } from './find-one-customer.usecase';
import { hashPhone } from '../../common/utils/phone-hash.util';

const validUuid = '11111111-1111-1111-8111-111111111111';

function createMocks() {
    const customerRepository = {
        findOne: jest.fn(),
    };

    const useCase = new FindOneCustomerUseCase(customerRepository as never);

    return { useCase, customerRepository };
}

describe('FindOneCustomerUseCase', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, PHONE_HASH_SECRET: 'test-secret' };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it('busca por id cuando el término es un UUID', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue({ id: validUuid });

        await mocks.useCase.execute(validUuid);

        expect(mocks.customerRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: validUuid } }),
        );
    });

    it('busca por phoneHash cuando el término no es un UUID', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue({ id: 'c1' });

        await mocks.useCase.execute('5512345678');

        expect(mocks.customerRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { phoneHash: hashPhone('5512345678') },
            }),
        );
    });

    it('lanza NotFoundException si no se encuentra el cliente', async () => {
        const mocks = createMocks();
        mocks.customerRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('5512345678')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('retorna el cliente encontrado', async () => {
        const mocks = createMocks();
        const customer = { id: 'c1', fullName: 'Juan' };
        mocks.customerRepository.findOne.mockResolvedValue(customer);

        const result = await mocks.useCase.execute('5512345678');

        expect(result).toBe(customer);
    });
});
