import { Logger, NotFoundException } from '@nestjs/common';
import { BaseFindOneCatalogUseCase } from './base-find-one-catalog.usecase';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';

class FakeCatalogEntity extends BaseCatalogEntity { }

class TestFindOneUseCase extends BaseFindOneCatalogUseCase<FakeCatalogEntity> {
    protected readonly logger = new Logger(TestFindOneUseCase.name);
    protected readonly entityName = 'FakeCatalog';
}

describe('BaseFindOneCatalogUseCase', () => {
    let findOneMock: jest.Mock;
    let useCase: TestFindOneUseCase;
    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        findOneMock = jest.fn();
        useCase = new TestFindOneUseCase({ findOne: findOneMock } as never);
    });

    it('busca por id cuando el término es un UUID', async () => {
        findOneMock.mockResolvedValue({ id: VALID_UUID });

        await useCase.execute(VALID_UUID);

        expect(findOneMock).toHaveBeenCalledWith({ where: { id: VALID_UUID } });
    });

    it('busca por nombre en mayúsculas cuando el término no es un UUID', async () => {
        findOneMock.mockResolvedValue({ id: '1', name: 'CHOCOLATE' });

        await useCase.execute('chocolate');

        expect(findOneMock).toHaveBeenCalledWith({ where: { name: 'CHOCOLATE' } });
    });

    it('lanza NotFoundException si no encuentra la entidad', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(useCase.execute('inexistente')).rejects.toThrow(
            NotFoundException,
        );
    });
});
