import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateFruitDto } from './create-fruit.dto';

describe('CreateFruitDto', () => {
    it('hereda las validaciones de BaseCreateCatalogDto', async () => {
        const dto = plainToInstance(CreateFruitDto, {
            name: 'Fresa',
            price: 12,
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('rechaza cuando falta el nombre', async () => {
        const dto = plainToInstance(CreateFruitDto, {});

        const errors = await validate(dto);

        expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
});
