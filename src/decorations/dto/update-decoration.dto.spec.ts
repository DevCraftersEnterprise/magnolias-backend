import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateDecorationDto } from './update-decoration.dto';

describe('UpdateDecorationDto', () => {
    it('hereda las validaciones de BaseUpdateCatalogDto y permite un update parcial', async () => {
        const dto = plainToInstance(UpdateDecorationDto, { isActive: false });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
