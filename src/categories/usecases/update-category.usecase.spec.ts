import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateCategoryUseCase } from './update-category.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateCategoryUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: UpdateCategoryUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new UpdateCategoryUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si la categoría no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(
            useCase.execute('category-1', { name: 'postres' }, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nuevo nombre ya pertenece a otra categoría', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'category-1', name: 'PASTELES' })
            .mockResolvedValueOnce({ id: 'category-2', name: 'POSTRES' });

        await expect(
            useCase.execute('category-1', { name: 'postres' }, user),
        ).rejects.toThrow(ConflictException);
    });

    it('actualiza la categoría normalizando el nombre a mayúsculas', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'category-1', name: 'PASTELES' })
            .mockResolvedValueOnce(null);

        const result = await useCase.execute(
            'category-1',
            { name: 'postres' },
            user,
        );

        expect(result).toEqual(
            expect.objectContaining({
                id: 'category-1',
                name: 'POSTRES',
                updatedBy: user,
            }),
        );
    });
});
