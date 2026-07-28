import { ConflictException } from '@nestjs/common';
import { CreateStyleUseCase } from './create-style.usecase';
import type { User } from '../../users/entities/user.entity';

describe('CreateStyleUseCase', () => {
    let findOneMock: jest.Mock;
    let createMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: CreateStyleUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        createMock = jest.fn((data) => data);
        saveMock = jest.fn((entity) =>
            Promise.resolve({ ...entity, id: 'style-1' }),
        );

        useCase = new CreateStyleUseCase({
            findOne: findOneMock,
            create: createMock,
            save: saveMock,
        } as never);
    });

    it('crea un estilo nuevo normalizando el nombre a mayúsculas', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await useCase.execute(
            { name: 'rústico', description: 'estilo rústico' },
            user,
        );

        expect(findOneMock).toHaveBeenCalledWith({
            where: { name: 'RÚSTICO' },
        });
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'RÚSTICO',
                createdBy: user,
                updatedBy: user,
            }),
        );
        expect(result.id).toBe('style-1');
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
        findOneMock.mockResolvedValue({ id: 'existing', name: 'RÚSTICO' });

        await expect(
            useCase.execute({ name: 'rústico', description: 'x' }, user),
        ).rejects.toThrow(ConflictException);

        expect(saveMock).not.toHaveBeenCalled();
    });
});
