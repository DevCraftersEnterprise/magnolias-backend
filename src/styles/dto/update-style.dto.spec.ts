import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateStyleDto } from './update-style.dto';

describe('UpdateStyleDto', () => {
    it('es válido con un update parcial que solo trae applicableSizes', async () => {
        const dto = plainToInstance(UpdateStyleDto, { applicableSizes: ['20P'] });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rechaza un valor de tamaño inválido', async () => {
        const dto = plainToInstance(UpdateStyleDto, { applicableSizes: ['NO_EXISTE'] });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'applicableSizes')).toBe(true);
    });
});
