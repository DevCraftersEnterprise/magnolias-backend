import { Logger } from '@nestjs/common';
import { BaseFindAllCatalogUseCase } from './base-find-all-catalog.usecase';
import { BaseCatalogEntity } from '../entities/base-catalog.entity';

class FakeCatalogEntity extends BaseCatalogEntity { }

class TestFindAllUseCase extends BaseFindAllCatalogUseCase<FakeCatalogEntity> {
    protected readonly logger = new Logger(TestFindAllUseCase.name);
    protected readonly entityName = 'FakeCatalog';
}

describe('BaseFindAllCatalogUseCase', () => {
    let findAndCountMock: jest.Mock;
    let useCase: TestFindAllUseCase;

    beforeEach(() => {
        findAndCountMock = jest.fn();
        useCase = new TestFindAllUseCase({
            findAndCount: findAndCountMock,
        } as never);
    });

    it('retorna respuesta paginada cuando se envían limit y offset', async () => {
        findAndCountMock.mockResolvedValue([[{ id: '1', name: 'CHOCOLATE' }], 1]);

        const result = await useCase.execute({ limit: 10, offset: 0 });

        expect(findAndCountMock).toHaveBeenCalledWith(
            expect.objectContaining({ take: 10, skip: 0, order: { name: 'ASC' } }),
        );
        expect(result).toEqual({
            items: [{ id: '1', name: 'CHOCOLATE' }],
            total: 1,
            pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
        });
    });

    it('retorna un arreglo plano cuando no se envían limit/offset', async () => {
        findAndCountMock.mockResolvedValue([[{ id: '1', name: 'CHOCOLATE' }], 1]);

        const result = await useCase.execute({});

        expect(Array.isArray(result)).toBe(true);
    });

    it('calcula correctamente currentPage/totalPages con distintos offsets', async () => {
        findAndCountMock.mockResolvedValue([[], 25]);

        const result = await useCase.execute({ limit: 10, offset: 20 });

        expect(result).toEqual({
            items: [],
            total: 25,
            pagination: { limit: 10, offset: 20, totalPages: 3, currentPage: 3 },
        });
    });
});
