import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PricedUpdateCatalogDto } from './priced-update-catalog.dto';

function build(
    overrides: Partial<PricedUpdateCatalogDto> = {},
): PricedUpdateCatalogDto {
    return plainToInstance(PricedUpdateCatalogDto, { ...overrides });
}

describe('PricedUpdateCatalogDto', () => {
    it('permite un update parcial sin price', async () => {
        const errors = await validate(build({ isActive: false }));
        expect(errors).toHaveLength(0);
    });

    it('acepta un price numérico válido', async () => {
        const errors = await validate(build({ price: 25 }));
        expect(errors).toHaveLength(0);
    });

    it('rechaza un price negativo', async () => {
        const errors = await validate(build({ price: -1 }));
        expect(errors.some((e) => e.property === 'price')).toBe(true);
    });
});
