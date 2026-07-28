import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateStyleUseCase } from './update-style.usecase';
import type { User } from '../../users/entities/user.entity';

describe('UpdateStyleUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: UpdateStyleUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new UpdateStyleUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si el estilo no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(
            useCase.execute('style-1', { name: 'moderno' }, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nuevo nombre ya pertenece a otro estilo', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'style-1', name: 'RÚSTICO' })
            .mockResolvedValueOnce({ id: 'style-2', name: 'MODERNO' });

        await expect(
            useCase.execute('style-1', { name: 'moderno' }, user),
        ).rejects.toThrow(ConflictException);
    });

    it('actualiza el estilo normalizando el nombre a mayúsculas', async () => {
        findOneMock
            .mockResolvedValueOnce({ id: 'style-1', name: 'RÚSTICO' })
            .mockResolvedValueOnce(null);

        const result = await useCase.execute(
            'style-1',
            { name: 'moderno' },
            user,
        );

        expect(result).toEqual(
            expect.objectContaining({
                id: 'style-1',
                name: 'MODERNO',
                updatedBy: user,
            }),
        );
    });
});
