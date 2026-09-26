/**
 * Rondas de entrega para pedidos de domicilio o eventos
 * Son 3 rondas (horarios específicos definidos en la configuración del sistema)
 * más una ronda especial (fuera de los horarios habituales) con un costo
 * adicional (ver `Order.specialRoundCost`, cliente #3).
 */
export enum DeliveryRound {
  ROUND_1 = 'ROUND_1',
  ROUND_2 = 'ROUND_2',
  ROUND_3 = 'ROUND_3',
  RONDA_ESPECIAL = 'RONDA_ESPECIAL',
}
