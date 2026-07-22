import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateFlavorUseCase } from './update-flavor.usecase';
import type { User } from '../../users/entities/user.entity';

jest.mock('../../common/entities/base-catalog.entity', () => ({
    BaseCatalogEntity: class BaseCatalogEntity { },
}));

describe('UpdateFlavorUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: UpdateFlavorUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new UpdateFlavorUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si el sabor no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(
            useCase.execute('flavor-1', { name: 'vainilla' }, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nuevo nombre ya pertenece a otro sabor', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'flavor-1', name: 'CHOCOLATE' })
            .mockResolvedValueOnce({ id: 'flavor-2', name: 'VAINILLA' });

        await expect(
            useCase.execute('flavor-1', { name: 'vainilla' }, user),
        ).rejects.toThrow(ConflictException);
    });

    it('actualiza el sabor normalizando el nombre a mayúsculas', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'flavor-1', name: 'CHOCOLATE' })
            .mockResolvedValueOnce(null);

        const result = await useCase.execute(
            'flavor-1',
            { name: 'vainilla' },
            user,
        );

        expect(result).toEqual(
            expect.objectContaining({
                id: 'flavor-1',
                name: 'VAINILLA',
                updatedBy: user,
            }),
        );
    });
});
