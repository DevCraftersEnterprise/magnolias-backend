import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateFillingDto } from './update-filling.dto';

describe('UpdateFillingDto', () => {
    it('hereda las validaciones de PricedUpdateCatalogDto y permite un update parcial', async () => {
        const dto = plainToInstance(UpdateFillingDto, { isActive: false });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
