import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DecorationsFilterDto } from './decorations-filter.dto';

describe('DecorationsFilterDto', () => {
    it('es válido sin isActive', async () => {
        const dto = plainToInstance(DecorationsFilterDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('transforma isActive de string a boolean', () => {
        const dto = plainToInstance(DecorationsFilterDto, { isActive: 'true' });

        expect(dto.isActive).toBe(true);
    });

    it('convierte un valor no reconocido a undefined (queda opcional)', async () => {
        const dto = plainToInstance(DecorationsFilterDto, { isActive: 'not-a-boolean' });

        const errors = await validate(dto);

        expect(dto.isActive).toBeUndefined();
        expect(errors).toHaveLength(0);
    });
});
