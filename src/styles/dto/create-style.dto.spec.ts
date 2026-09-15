import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateStyleDto } from './create-style.dto';

function build(overrides: Partial<CreateStyleDto> = {}): CreateStyleDto {
    return plainToInstance(CreateStyleDto, {
        name: 'Rústico',
        ...overrides,
    });
}

describe('CreateStyleDto', () => {
    it('es válido sin applicableSizes (aplica a cualquier tamaño)', async () => {
        const errors = await validate(build());
        expect(errors).toHaveLength(0);
    });

    it('acepta un arreglo de tamaños válidos', async () => {
        const errors = await validate(build({ applicableSizes: ['20P', '30P'] as never }));
        expect(errors).toHaveLength(0);
    });

    it('rechaza un valor de tamaño inválido', async () => {
        const errors = await validate(build({ applicableSizes: ['NO_EXISTE'] as never }));
        expect(errors.some((e) => e.property === 'applicableSizes')).toBe(true);
    });

    it('rechaza cuando applicableSizes no es un arreglo', async () => {
        const errors = await validate(build({ applicableSizes: '20P' as never }));
        expect(errors.some((e) => e.property === 'applicableSizes')).toBe(true);
    });
});
