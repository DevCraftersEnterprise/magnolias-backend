import { NotFoundException } from '@nestjs/common';
import { FindOneBranchUseCase } from './find-one-branch.usecase';

const validUuid = '11111111-1111-1111-8111-111111111111';

function createMocks() {
    const branchRepository = {
        findOne: jest.fn(),
    };

    const useCase = new FindOneBranchUseCase(branchRepository as never);

    return { useCase, branchRepository };
}

describe('FindOneBranchUseCase', () => {
    it('busca por id y por name cuando el término es un UUID', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue({ id: validUuid });

        await mocks.useCase.execute(validUuid);

        expect(mocks.branchRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: [{ id: validUuid }, { name: validUuid }],
            }),
        );
    });

    it('busca solo por name cuando el término no es un UUID', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue({ id: 'b1' });

        await mocks.useCase.execute('Sucursal Centro');

        expect(mocks.branchRepository.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: [{ name: 'Sucursal Centro' }],
            }),
        );
    });

    it('lanza NotFoundException si no se encuentra la sucursal', async () => {
        const mocks = createMocks();
        mocks.branchRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('inexistente')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('retorna la sucursal encontrada', async () => {
        const mocks = createMocks();
        const branch = { id: 'b1', name: 'Sucursal Centro' };
        mocks.branchRepository.findOne.mockResolvedValue(branch);

        const result = await mocks.useCase.execute('Sucursal Centro');

        expect(result).toBe(branch);
    });
});
