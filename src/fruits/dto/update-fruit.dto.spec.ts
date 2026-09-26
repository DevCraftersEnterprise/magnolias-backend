import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateFruitDto } from './update-fruit.dto';

describe('UpdateFruitDto', () => {
    it('hereda las validaciones de BaseUpdateCatalogDto y permite un update parcial', async () => {
        const dto = plainToInstance(UpdateFruitDto, { isActive: false });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
