import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

function hasErrorOn(errors: { property: string }[], property: string) {
  return errors.some((e) => e.property === property);
}

function baseData(overrides: Record<string, unknown> = {}) {
  return {
    customerId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    branchId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567891',
    deliveryDate: new Date(),
    details: [
      {
        productId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567892',
        price: 100,
        quantity: 1,
        hasWriting: false,
      },
    ],
    ...overrides,
  };
}

describe('CreateOrderDto', () => {
  describe('deliveryRound', () => {
    it('es requerido cuando el pedido es domicilio implícito (ni evento ni en tienda)', async () => {
      const dto = plainToInstance(CreateOrderDto, baseData());
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryRound')).toBe(true);
    });

    it('no es requerido cuando isEnTienda es true', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ isEnTienda: true }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryRound')).toBe(false);
    });

    it('no es requerido cuando isEvento es true', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ isEvento: true }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryRound')).toBe(false);
    });

    it('no lanza error si se envía un valor válido para domicilio', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryRound')).toBe(false);
    });
  });

  describe('deliveryAddress', () => {
    it('no lanza error si se omite (no es estrictamente requerido a nivel DTO)', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryAddress')).toBe(false);
    });

    it('se valida (nested) cuando se envía y isEnTienda es false', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({
          deliveryRound: 'ROUND_1',
          deliveryAddress: { useCustomerAddress: true },
        }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryAddress')).toBe(false);
    });

    it('no se valida cuando isEnTienda es true, aunque venga incompleta', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({
          isEnTienda: true,
          deliveryAddress: { useCustomerAddress: false },
        }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'deliveryAddress')).toBe(false);
    });
  });

  describe('flowers', () => {
    it('es requerido cuando includesFlowers es true', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1', includesFlowers: true }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'flowers')).toBe(true);
    });

    it('no se exige cuando includesFlowers es false/undefined', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'flowers')).toBe(false);
    });

    it('pasa validación cuando includesFlowers es true y se envía al menos una flor', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({
          deliveryRound: 'ROUND_1',
          includesFlowers: true,
          flowers: [{ flowerId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567893', quantity: 1 }],
        }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'flowers')).toBe(false);
    });
  });

  describe('transferAccount', () => {
    it('es requerido cuando paymentMethod es TRANSFER', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1', paymentMethod: 'TRANSFER' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'transferAccount')).toBe(true);
    });

    it('no se exige cuando paymentMethod es CASH/CARD/undefined', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1', paymentMethod: 'CASH' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'transferAccount')).toBe(false);
    });

    it('pasa validación cuando paymentMethod es TRANSFER y se envía la cuenta', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({
          deliveryRound: 'ROUND_1',
          paymentMethod: 'TRANSFER',
          transferAccount: 'BBVA 1234567890',
        }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'transferAccount')).toBe(false);
    });
  });

  describe('isEvento / isEnTienda / includesFlowers', () => {
    it('acepta un pedido de domicilio válido sin ninguna bandera marcada', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({
          deliveryRound: 'ROUND_1',
          deliveryAddress: { useCustomerAddress: true },
        }),
      );
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('rechaza valores no booleanos', async () => {
      const dto = plainToInstance(
        CreateOrderDto,
        baseData({ deliveryRound: 'ROUND_1', isEvento: 'no-es-booleano' }),
      );
      const errors = await validate(dto);

      expect(hasErrorOn(errors, 'isEvento')).toBe(true);
    });
  });
});
