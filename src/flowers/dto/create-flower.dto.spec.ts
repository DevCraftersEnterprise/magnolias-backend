import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateFlowerDto } from './create-flower.dto';

describe('CreateFlowerDto', () => {
    it('hereda las validaciones de PricedCreateCatalogDto', async () => {
        const dto = plainToInstance(CreateFlowerDto, {
            name: 'Rosa',
            price: 8,
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('rechaza cuando falta el nombre', async () => {
        const dto = plainToInstance(CreateFlowerDto, {});

        const errors = await validate(dto);

        expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
});
