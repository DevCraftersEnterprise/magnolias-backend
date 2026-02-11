/**
 * Tipos de pedidos según nomenclatura del negocio.
 * H-ESP: Pedido especial
 * DOMICILIO: Pedido a domicilio
 * TIENDA: Pedido en tienda
 * FLOR: Pedido con flores
 * VITRINA: Pedido de vitrina (producto existente con modificaciones)
 * EVENTO: Pedido para eventos
 * PERSONALIZADO: Pedido personalizado
 */
export enum OrderType {
  H_ESP = 'H-ESP',
  DOMICILIO = 'DOMICILIO',
  TIENDA = 'TIENDA',
  FLOR = 'FLOR',
  VITRINA = 'VITRINA',
  EVENTO = 'EVENTO',
  PERSONALIZADO = 'PERSONALIZADO',
}
