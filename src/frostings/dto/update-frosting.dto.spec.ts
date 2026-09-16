import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateFrostingDto } from './update-frosting.dto';

describe('UpdateFrostingDto', () => {
    it('hereda las validaciones de PricedUpdateCatalogDto y permite un update parcial', async () => {
        const dto = plainToInstance(UpdateFrostingDto, { isActive: false });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
