import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateFrostingDto } from './create-frosting.dto';

describe('CreateFrostingDto', () => {
    it('hereda las validaciones de PricedCreateCatalogDto', async () => {
        const dto = plainToInstance(CreateFrostingDto, {
            name: 'Chantilly',
            price: 8,
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('rechaza cuando falta el nombre', async () => {
        const dto = plainToInstance(CreateFrostingDto, {});

        const errors = await validate(dto);

        expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
});
