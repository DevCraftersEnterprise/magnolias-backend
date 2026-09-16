import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateFillingDto } from './create-filling.dto';

describe('CreateFillingDto', () => {
    it('hereda las validaciones de PricedCreateCatalogDto', async () => {
        const dto = plainToInstance(CreateFillingDto, {
            name: 'Fresa',
            price: 8,
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('rechaza cuando falta el nombre', async () => {
        const dto = plainToInstance(CreateFillingDto, {});

        const errors = await validate(dto);

        expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
});
