import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateDecorationDto } from './create-decoration.dto';

describe('CreateDecorationDto', () => {
    it('hereda las validaciones de BaseCreateCatalogDto', async () => {
        const dto = plainToInstance(CreateDecorationDto, {
            name: 'Perlas doradas',
            price: 8,
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('rechaza cuando falta el nombre', async () => {
        const dto = plainToInstance(CreateDecorationDto, {});

        const errors = await validate(dto);

        expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
});
