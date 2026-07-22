import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveFlavorUseCase } from './remove-flavor.usecase';
import type { User } from '../../users/entities/user.entity';

jest.mock('../../common/entities/base-catalog.entity', () => ({
    BaseCatalogEntity: class BaseCatalogEntity { },
}));

describe('RemoveFlavorUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: RemoveFlavorUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new RemoveFlavorUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si el sabor no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(useCase.execute('flavor-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('lanza BadRequestException si ya estaba inactivo', async () => {
        findOneMock.mockResolvedValue({ id: 'flavor-1', isActive: false });

        await expect(useCase.execute('flavor-1', user)).rejects.toThrow(
            BadRequestException,
        );
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('marca el sabor como inactivo (soft delete)', async () => {
        findOneMock.mockResolvedValue({ id: 'flavor-1', isActive: true });

        await useCase.execute('flavor-1', user);

        expect(saveMock).toHaveBeenCalledWith(
            expect.objectContaining({ isActive: false, updatedBy: user }),
        );
    });
});
