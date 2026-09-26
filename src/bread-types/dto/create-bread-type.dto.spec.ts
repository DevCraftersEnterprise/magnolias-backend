import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBreadTypeDto } from './create-bread-type.dto';

describe('CreateBreadTypeDto', () => {
    it('hereda las validaciones de PricedCreateCatalogDto', async () => {
        const dto = plainToInstance(CreateBreadTypeDto, {
            name: 'Vainilla',
            price: 8,
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('rechaza cuando falta el nombre', async () => {
        const dto = plainToInstance(CreateBreadTypeDto, {});

        const errors = await validate(dto);

        expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
});
