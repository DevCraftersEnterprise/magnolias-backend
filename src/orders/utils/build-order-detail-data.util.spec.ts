import {
  buildOrderDetailData,
  mapOrderDetailTierData,
} from './build-order-detail-data.util';

const user = { id: 'user-1' } as never;
const order = { id: 'order-1' } as never;
const product = { id: 'product-1' } as never;

describe('mapOrderDetailTierData', () => {
  it('mapea los ids del DTO a relaciones {id} y agrega auditoría', () => {
    const result = mapOrderDetailTierData(
      {
        position: 1,
        productSize: '30P' as never,
        customSize: undefined,
        breadTypeId: 'bread-1',
        fillingId: 'filling-1',
        frostingId: 'frosting-1',
        colorId: 'color-1',
      },
      user,
    );

    expect(result).toEqual({
      position: 1,
      productSize: '30P',
      customSize: undefined,
      breadType: { id: 'bread-1' },
      filling: { id: 'filling-1' },
      frosting: { id: 'frosting-1' },
      color: { id: 'color-1' },
      createdBy: user,
      updatedBy: user,
    });
  });
});

describe('buildOrderDetailData', () => {
  function baseDetailDto(overrides: Record<string, unknown> = {}) {
    return {
      productId: 'product-1',
      price: 100,
      quantity: 2,
      hasWriting: false,
      ...overrides,
    } as never;
  }

  it('mapea los ids del detalle a relaciones {id} y agrega auditoría', () => {
    const result = buildOrderDetailData(
      baseDetailDto({
        breadTypeId: 'bread-1',
        fillingId: 'filling-1',
        frostingId: 'frosting-1',
        colorId: 'color-1',
        styleId: 'style-1',
      }),
      order,
      product,
      user,
    );

    expect(result).toMatchObject({
      breadType: { id: 'bread-1' },
      filling: { id: 'filling-1' },
      frosting: { id: 'frosting-1' },
      color: { id: 'color-1' },
      style: { id: 'style-1' },
      order,
      product,
      createdBy: user,
      updatedBy: user,
    });
  });

  it('no agrega datos de autorización de descuento cuando discountPercent es 0 o no viene', () => {
    const result = buildOrderDetailData(baseDetailDto(), order, product, user);

    expect(result).not.toHaveProperty('discountAuthorizedBy');
    expect(result).not.toHaveProperty('discountAuthorizedAt');
  });

  it('agrega discountAuthorizedBy/At cuando discountPercent > 0', () => {
    const result = buildOrderDetailData(
      baseDetailDto({ discountPercent: 10 }),
      order,
      product,
      user,
      'admin-1',
    );

    expect(result.discountAuthorizedBy).toEqual({ id: 'admin-1' });
    expect(result.discountAuthorizedAt).toBeInstanceOf(Date);
  });

  it('mapea tiers cuando vienen en el DTO', () => {
    const result = buildOrderDetailData(
      baseDetailDto({
        tiers: [
          { position: 1, productSize: '30P', breadTypeId: 'bread-1' },
          { position: 2, productSize: '20P', colorId: 'color-1' },
        ],
      }),
      order,
      product,
      user,
    );

    expect(result.tiers).toEqual([
      expect.objectContaining({ position: 1, breadType: { id: 'bread-1' } }),
      expect.objectContaining({ position: 2, color: { id: 'color-1' } }),
    ]);
  });

  it('deja tiers como undefined cuando el detalle no trae pisos', () => {
    const result = buildOrderDetailData(baseDetailDto(), order, product, user);

    expect(result.tiers).toBeUndefined();
  });
});
