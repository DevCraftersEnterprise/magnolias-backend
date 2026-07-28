import { ConflictException } from '@nestjs/common';
import { CreateCategoryUseCase } from './create-category.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateCategoryUseCase', () => {
    let findOneMock: jest.Mock;
    let createMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: CreateCategoryUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        createMock = jest.fn((data) => data);
        saveMock = jest.fn((entity) =>
            Promise.resolve({ ...entity, id: 'category-1' }),
        );

        useCase = new CreateCategoryUseCase({
            findOne: findOneMock,
            create: createMock,
            save: saveMock,
        } as never);
    });

    it('crea una categoría nueva normalizando el nombre a mayúsculas', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await useCase.execute(
            { name: 'pasteles', description: 'categoría de pasteles' },
            user,
        );

        expect(findOneMock).toHaveBeenCalledWith({
            where: { name: 'PASTELES' },
        });
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'PASTELES',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(result.id).toBe('category-1');
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
        findOneMock.mockResolvedValue({ id: 'existing', name: 'PASTELES' });

        await expect(
            useCase.execute({ name: 'pasteles', description: 'x' }, user),
        ).rejects.toThrow(ConflictException);

        expect(saveMock).not.toHaveBeenCalled();
    });
});
