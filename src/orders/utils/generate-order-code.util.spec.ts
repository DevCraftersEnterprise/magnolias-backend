import { generateOrderCode, getOrderTypePrefix } from './generate-order-code.util';

describe('getOrderTypePrefix', () => {
  it('devuelve EVE cuando isEvento es true', () => {
    expect(getOrderTypePrefix({ isEvento: true, isEnTienda: false })).toBe('EVE');
  });

  it('devuelve VIT cuando isEnTienda es true', () => {
    expect(getOrderTypePrefix({ isEvento: false, isEnTienda: true })).toBe('VIT');
  });

  it('devuelve DOM cuando ninguna bandera está activa (domicilio implícito)', () => {
    expect(getOrderTypePrefix({ isEvento: false, isEnTienda: false })).toBe('DOM');
  });

  it('prioriza EVE si ambas banderas vinieran activas', () => {
    expect(getOrderTypePrefix({ isEvento: true, isEnTienda: true })).toBe('EVE');
  });
});

describe('generateOrderCode', () => {
  const branch = { id: 'branch-1', name: 'Navarrete' } as never;

  function mockRepository(lastOrder: { orderCode: string } | null) {
    return {
      findOne: jest.fn().mockResolvedValue(lastOrder),
    };
  }

  it('genera secuencia 0001 cuando no hay pedidos previos', async () => {
    const repo = mockRepository(null);

    const code = await generateOrderCode(
      repo as never,
      { isEvento: false, isEnTienda: false },
      branch,
    );

    expect(code).toBe(`DOM-NAVARRETE-${new Date().getFullYear()}-0001`);
  });

  it('incrementa la secuencia a partir del último código encontrado', async () => {
    const repo = mockRepository({
      orderCode: `VIT-NAVARRETE-${new Date().getFullYear()}-0007`,
    });

    const code = await generateOrderCode(
      repo as never,
      { isEvento: false, isEnTienda: true },
      branch,
    );

    expect(code).toBe(`VIT-NAVARRETE-${new Date().getFullYear()}-0008`);
  });

  it('reinicia a la secuencia 1 si el último código está malformado', async () => {
    const repo = mockRepository({ orderCode: 'CODIGO-INVALIDO' });

    const code = await generateOrderCode(
      repo as never,
      { isEvento: true, isEnTienda: false },
      branch,
    );

    expect(code).toBe(`EVE-NAVARRETE-${new Date().getFullYear()}-0001`);
  });

  it('filtra la búsqueda de secuencia por isEvento/isEnTienda y sucursal', async () => {
    const repo = mockRepository(null);

    await generateOrderCode(
      repo as never,
      { isEvento: false, isEnTienda: false },
      branch,
    );

    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isEvento: false,
          isEnTienda: false,
          branch: { id: 'branch-1' },
        }),
      }),
    );
  });
});
