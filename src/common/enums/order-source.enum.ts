/**
 * Canal por el que se originó un pedido. Se captura al crear el pedido
 * para que, más adelante, pueda usarse en reportes de ventas por canal.
 */
export enum OrderSource {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  PHONE_CALL = 'PHONE_CALL',
  IN_PERSON = 'IN_PERSON',
}
