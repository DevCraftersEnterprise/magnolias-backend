import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateFlowerDto } from './update-flower.dto';

describe('UpdateFlowerDto', () => {
    it('hereda las validaciones de PricedUpdateCatalogDto y permite un update parcial', async () => {
        const dto = plainToInstance(UpdateFlowerDto, { isActive: false });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
