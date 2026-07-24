import { ConflictException, Logger } from '@nestjs/common';
import { BaseCreateCatalogUseCase } from './base-create-catalog.usecase';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';
import type { User } from '../../users/entities/user.entity';

class FakeCatalogEntity extends BaseCatalogEntity { }

class TestCreateUseCase extends BaseCreateCatalogUseCase<FakeCatalogEntity> {
    protected readonly logger = new Logger(TestCreateUseCase.name);
    protected readonly entityName = 'FakeCatalog';
}

describe('BaseCreateCatalogUseCase', () => {
    let findOneMock: jest.Mock;
    let createMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: TestCreateUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        createMock = jest.fn((data) => data);
        saveMock = jest.fn((entity) =>
            Promise.resolve({ ...entity, id: 'entity-1' }),
        );
        useCase = new TestCreateUseCase({
            findOne: findOneMock,
            create: createMock,
            save: saveMock,
        } as never);
    });

    it('crea la entidad normalizando el nombre a mayúsculas', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await useCase.execute(
            { name: 'chocolate', description: 'rico' },
            user,
        );

        expect(findOneMock).toHaveBeenCalledWith({
            where: { name: 'CHOCOLATE' },
        });
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'CHOCOLATE',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(result.id).toBe('entity-1');
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
        findOneMock.mockResolvedValue({ id: 'existing', name: 'CHOCOLATE' });

        await expect(
            useCase.execute({ name: 'chocolate', description: 'rico' }, user),
        ).rejects.toThrow(ConflictException);

        expect(saveMock).not.toHaveBeenCalled();
    });

    it('el mensaje de error usa el entityName configurado por la subclase', async () => {
        findOneMock.mockResolvedValue({ id: 'existing', name: 'CHOCOLATE' });

        await expect(
            useCase.execute({ name: 'chocolate', description: 'rico' }, user),
        ).rejects.toThrow('FakeCatalog with name chocolate already exists');
    });
});
