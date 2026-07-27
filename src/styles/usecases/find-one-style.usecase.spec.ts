import { NotFoundException } from '@nestjs/common';
import { FindOneStyleUseCase } from './find-one-style.usecase';

describe('FindOneStyleUseCase', () => {
    let findOneMock: jest.Mock;
    let useCase: FindOneStyleUseCase;
    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        findOneMock = jest.fn();
        useCase = new FindOneStyleUseCase({ findOne: findOneMock } as never);
    });

    it('busca por id cuando el término es un UUID', async () => {
        findOneMock.mockResolvedValue({ id: VALID_UUID });

        await useCase.execute(VALID_UUID);

        expect(findOneMock).toHaveBeenCalledWith({ where: { id: VALID_UUID } });
    });

    it('busca por nombre en mayúsculas cuando el término no es un UUID', async () => {
        findOneMock.mockResolvedValue({ id: '1', name: 'RÚSTICO' });

        await useCase.execute('rústico');

        expect(findOneMock).toHaveBeenCalledWith({ where: { name: 'RÚSTICO' } });
    });

    it('lanza NotFoundException si no encuentra el estilo', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(useCase.execute('inexistente')).rejects.toThrow(
            NotFoundException,
        );
    });
});
