import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { BaseRemoveCatalogUseCase } from './base-remove-catalog.usecase';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';
import type { User } from '../../users/entities/user.entity';

class FakeCatalogEntity extends BaseCatalogEntity { }

class TestRemoveUseCase extends BaseRemoveCatalogUseCase<FakeCatalogEntity> {
    protected readonly logger = new Logger(TestRemoveUseCase.name);
    protected readonly entityName = 'FakeCatalog';
}

describe('BaseRemoveCatalogUseCase', () => {
    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;
    let useCase: TestRemoveUseCase;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        findOneMock = jest.fn();
        saveMock = jest.fn((entity) => Promise.resolve(entity));
        useCase = new TestRemoveUseCase({
            findOne: findOneMock,
            save: saveMock,
        } as never);
    });

    it('lanza NotFoundException si la entidad no existe', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(useCase.execute('id-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('lanza BadRequestException si ya estaba inactiva', async () => {
        findOneMock.mockResolvedValue({ id: 'id-1', isActive: false });

        await expect(useCase.execute('id-1', user)).rejects.toThrow(
            BadRequestException,
        );
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('marca la entidad como inactiva (soft delete)', async () => {
        findOneMock.mockResolvedValue({ id: 'id-1', isActive: true });

        await useCase.execute('id-1', user);

        expect(saveMock).toHaveBeenCalledWith(
            expect.objectContaining({ isActive: false, updatedBy: user }),
        );
    });
});
