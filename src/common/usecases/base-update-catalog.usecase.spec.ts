import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { BaseUpdateCatalogUseCase } from './base-update-catalog.usecase';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';
import type { User } from '../../users/entities/user.entity';

class FakeCatalogEntity extends BaseCatalogEntity { }

class TestUpdateUseCase extends BaseUpdateCatalogUseCase<FakeCatalogEntity> {
    protected readonly logger = new Logger(TestUpdateUseCase.name);
    protected readonly entityName = 'FakeCatalog';
}

describe('BaseUpdateCatalogUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: TestUpdateUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new TestUpdateUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si la entidad no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(
            useCase.execute('id-1', { name: 'vainilla' }, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nuevo nombre ya pertenece a otra entidad', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'id-1', name: 'CHOCOLATE' })
            .mockResolvedValueOnce({ id: 'id-2', name: 'VAINILLA' });

        await expect(
            useCase.execute('id-1', { name: 'vainilla' }, user),
        ).rejects.toThrow(ConflictException);
    });

    it('permite mantener el mismo nombre sin disparar duplicado', async () => {
        findOneMock.mockResolvedValueOnce({
            id: 'id-1',
            name: 'CHOCOLATE',
            isActive: true,
        });

        const result = await useCase.execute(
            'id-1',
            { name: 'chocolate', description: 'nuevo' },
            user,
        );

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
            expect.objectContaining({
                id: 'id-1',
                name: 'CHOCOLATE',
                description: 'nuevo',
                updatedBy: user,
            }),
        );
    });

    it('actualiza la entidad normalizando el nombre a mayúsculas', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'id-1', name: 'CHOCOLATE' })
            .mockResolvedValueOnce(null);

        const result = await useCase.execute('id-1', { name: 'vainilla' }, user);

        expect(result).toEqual(
            expect.objectContaining({
                id: 'id-1',
                name: 'VAINILLA',
                updatedBy: user,
            }),
        );
    });
});
