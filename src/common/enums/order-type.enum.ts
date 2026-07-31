/**
 * Tipos de pedidos según nomenclatura del negocio.
 * H-ESP: Pedido especial
 * DOMICILIO: Pedido a domicilio
 * TIENDA: Pedido en tienda
 * FLOR: Pedido con flores
 * VITRINA: Pedido de vitrina (producto existente con modificaciones).
 *   Se muestra al usuario como "En tienda" — el valor interno VITRINA
 *   no cambia, solo su etiqueta visible en el frontend.
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
