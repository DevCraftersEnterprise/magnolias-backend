import { ConflictException } from '@nestjs/common';
import { CreateFlavorUseCase } from './create-flavor.usecase';
import type { User } from '../../users/entities/user.entity';

jest.mock('../../common/entities/base-catalog.entity', () => ({
    BaseCatalogEntity: class BaseCatalogEntity { },
}));

describe('CreateFlavorUseCase', () => {
    let findOneMock: jest.Mock;
    let createMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: CreateFlavorUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        createMock = jest.fn((data) => data);
        saveMock = jest.fn((entity) =>
            Promise.resolve({ ...entity, id: 'flavor-1' }),
        );

        useCase = new CreateFlavorUseCase({
            findOne: findOneMock,
            create: createMock,
            save: saveMock,
        } as never);
    });

    it('crea un sabor nuevo normalizando el nombre a mayúsculas', async () => {
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
        expect(result.id).toBe('flavor-1');
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
        findOneMock.mockResolvedValue({ id: 'existing', name: 'CHOCOLATE' });

        await expect(
            useCase.execute({ name: 'chocolate', description: 'rico' }, user),
        ).rejects.toThrow(ConflictException);

        expect(saveMock).not.toHaveBeenCalled();
    });
});
