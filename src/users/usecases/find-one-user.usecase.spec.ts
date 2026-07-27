import { NotFoundException } from '@nestjs/common';
import { FindOneUserUseCase } from './find-one-user.usecase';

const validUuid = '11111111-1111-1111-8111-111111111111';

function createMocks() {
    const userRepository = {
        findOne: jest.fn(),
    };

    const useCase = new FindOneUserUseCase(userRepository as never);

    return { useCase, userRepository };
}

describe('FindOneUserUseCase', () => {
    it('busca por id y por name cuando el término es un UUID', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({ id: validUuid });

        await mocks.useCase.execute(validUuid);

        expect(mocks.userRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: [{ id: validUuid }, { name: validUuid }],
            }),
        );
    });

    it('busca solo por name cuando el término no es un UUID', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({ id: 'u1' });

        await mocks.useCase.execute('Juan');

        expect(mocks.userRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({ where: [{ name: 'Juan' }] }),
        );
    });

    it('lanza NotFoundException si no se encuentra el usuario', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('inexistente')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('retorna el usuario encontrado', async () => {
        const mocks = createMocks();
        const user = { id: 'u1', name: 'Juan' };
        mocks.userRepository.findOne.mockResolvedValue(user);

        const result = await mocks.useCase.execute('Juan');

        expect(result).toBe(user);
    });
});
