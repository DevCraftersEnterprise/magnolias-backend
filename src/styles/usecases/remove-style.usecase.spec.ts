import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveStyleUseCase } from './remove-style.usecase';
import type { User } from '../../users/entities/user.entity';

describe('RemoveStyleUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: RemoveStyleUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new RemoveStyleUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si el estilo no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(useCase.execute('style-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('lanza BadRequestException si ya estaba inactivo', async () => {
        findOneMock.mockResolvedValue({ id: 'style-1', isActive: false });

        await expect(useCase.execute('style-1', user)).rejects.toThrow(
            BadRequestException,
        );
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('marca el estilo como inactivo (soft delete)', async () => {
        findOneMock.mockResolvedValue({ id: 'style-1', isActive: true });

        await useCase.execute('style-1', user);

        expect(saveMock).toHaveBeenCalledWith(
            expect.objectContaining({ isActive: false, updatedBy: user }),
        );
    });
});
