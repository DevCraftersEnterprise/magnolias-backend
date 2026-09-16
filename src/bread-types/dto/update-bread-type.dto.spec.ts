import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateBreadTypeDto } from './update-bread-type.dto';

describe('UpdateBreadTypeDto', () => {
    it('hereda las validaciones de PricedUpdateCatalogDto y permite un update parcial', async () => {
        const dto = plainToInstance(UpdateBreadTypeDto, { isActive: false });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
