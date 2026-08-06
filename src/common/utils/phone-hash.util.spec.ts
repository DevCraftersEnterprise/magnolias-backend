import {
    buildPhoneIndexFields,
    getPhoneLast4,
    hashPhone,
    normalizePhoneDigits,
} from './phone-hash.util';

describe('phone-hash.util', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, PHONE_HASH_SECRET: 'test-secret' };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    describe('normalizePhoneDigits', () => {
        it('elimina todo lo que no sea dígito', () => {
            expect(normalizePhoneDigits('+1 (555) 123-4567')).toBe('15551234567');
        });

        it('retorna cadena vacía para null/undefined', () => {
            expect(normalizePhoneDigits(undefined as never)).toBe('');
            expect(normalizePhoneDigits(null as never)).toBe('');
        });
    });

    describe('hashPhone', () => {
        it('es determinístico: el mismo teléfono produce el mismo hash', () => {
            expect(hashPhone('5551234567')).toBe(hashPhone('5551234567'));
        });

        it('produce el mismo hash para números equivalentes con formato distinto', () => {
            expect(hashPhone('555-123-4567')).toBe(hashPhone('5551234567'));
        });

        it('produce hashes distintos para teléfonos distintos', () => {
            expect(hashPhone('5551234567')).not.toBe(hashPhone('5559999999'));
        });

        it('lanza error si PHONE_HASH_SECRET no está configurado', () => {
            delete process.env.PHONE_HASH_SECRET;
            expect(() => hashPhone('5551234567')).toThrow(
                /PHONE_HASH_SECRET environment variable is not set/,
            );
        });
    });

    describe('getPhoneLast4', () => {
        it('retorna los últimos 4 dígitos', () => {
            expect(getPhoneLast4('5551234567')).toBe('4567');
        });

        it('ignora caracteres no numéricos al extraer los últimos 4 dígitos', () => {
            expect(getPhoneLast4('+1 (555) 123-4567')).toBe('4567');
        });

        it('retorna todos los dígitos si hay menos de 4', () => {
            expect(getPhoneLast4('12')).toBe('12');
        });
    });

    describe('buildPhoneIndexFields', () => {
        it('retorna phoneHash y phoneLast4 juntos', () => {
            const result = buildPhoneIndexFields('5551234567');

            expect(result).toEqual({
                phoneHash: hashPhone('5551234567'),
                phoneLast4: '4567',
            });
        });
    });
});
