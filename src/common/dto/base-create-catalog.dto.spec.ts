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
    it('es válido sin price', async () => {
        const errors = await validate(build());
        expect(errors).toHaveLength(0);
    });

    it('acepta un price numérico válido', async () => {
        const errors = await validate(build({ price: 50 }));
        expect(errors).toHaveLength(0);
    });

    it('rechaza un price negativo', async () => {
        const errors = await validate(build({ price: -10 }));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('price');
    });

    it('rechaza un price que no es numérico', async () => {
        const errors = await validate(build({ price: 'gratis' as never }));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('price');
    });
});
