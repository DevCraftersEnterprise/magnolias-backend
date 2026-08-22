import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDetailDto } from './create-order-detail.dto';

function hasErrorOn(errors: { property: string }[], property: string) {
  return errors.some((e) => e.property === property);
}

function baseData(overrides: Record<string, unknown> = {}) {
  return {
    productId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    price: 100,
    quantity: 1,
    hasWriting: false,
    ...overrides,
  };
}

describe('CreateOrderDetailDto', () => {
  describe('customSize', () => {
    it('es requerido cuando productSize es CUSTOM', async () => {
      const dto = plainToInstance(
        CreateOrderDetailDto,
        baseData({ productSize: 'CUSTOM' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'customSize')).toBe(true);
    });

    it('no se exige cuando productSize no es CUSTOM', async () => {
      const dto = plainToInstance(
        CreateOrderDetailDto,
        baseData({ productSize: '20P' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'customSize')).toBe(false);
    });
  });

  describe('writingText', () => {
    it('es requerido cuando hasWriting es true', async () => {
      const dto = plainToInstance(
        CreateOrderDetailDto,
        baseData({ hasWriting: true }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'writingText')).toBe(true);
    });

    it('no se exige cuando hasWriting es false', async () => {
      const dto = plainToInstance(CreateOrderDetailDto, baseData());
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'writingText')).toBe(false);
    });
  });

  describe('tiers', () => {
    it('acepta un detalle sin tiers (pastel simple)', async () => {
      const dto = plainToInstance(CreateOrderDetailDto, baseData());
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'tiers')).toBe(false);
    });

    it('rechaza un array de 1 solo tier', async () => {
      const dto = plainToInstance(
        CreateOrderDetailDto,
        baseData({ tiers: [{ position: 1 }] }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'tiers')).toBe(true);
    });

    it('acepta 2 tiers válidos', async () => {
      const dto = plainToInstance(
        CreateOrderDetailDto,
        baseData({
          tiers: [
            { position: 1, productSize: '30P' },
            { position: 2, productSize: '20P' },
          ],
        }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'tiers')).toBe(false);
    });

    it('propaga errores anidados de un tier inválido (customSize requerido)', async () => {
      const dto = plainToInstance(
        CreateOrderDetailDto,
        baseData({
          tiers: [
            { position: 1, productSize: 'CUSTOM' },
            { position: 2, productSize: '20P' },
          ],
        }),
      );
      const errors = await validate(dto);

      const tiersError = errors.find((e) => e.property === 'tiers');
      expect(tiersError).toBeDefined();
      expect(tiersError!.children?.[0]?.children?.length).toBeGreaterThan(0);
    });
  });
});
