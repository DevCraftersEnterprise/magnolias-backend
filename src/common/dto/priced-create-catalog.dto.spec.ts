import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PricedCreateCatalogDto } from './priced-create-catalog.dto';

function build(
    overrides: Partial<PricedCreateCatalogDto> = {},
): PricedCreateCatalogDto {
    return plainToInstance(PricedCreateCatalogDto, {
        name: 'Chocolate',
        ...overrides,
    });
}

describe('PricedCreateCatalogDto', () => {
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
