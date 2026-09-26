import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BaseCreateCatalogDto } from './base-create-catalog.dto';

function build(
    overrides: Partial<BaseCreateCatalogDto> = {},
): BaseCreateCatalogDto {
    return plainToInstance(BaseCreateCatalogDto, {
        name: 'Chocolate',
        ...overrides,
    });
}

describe('BaseCreateCatalogDto', () => {
    it('es válido con solo name', async () => {
        const errors = await validate(build());
        expect(errors).toHaveLength(0);
    });

    it('rechaza si falta name', async () => {
        const errors = await validate(build({ name: undefined as never }));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('name');
    });

    it('no expone price (las categorías no manejan precio, cliente #1)', () => {
        const dto = build();
        expect((dto as unknown as Record<string, unknown>).price).toBeUndefined();
    });
});
