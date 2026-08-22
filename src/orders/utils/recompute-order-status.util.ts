import { OrderStatus } from '../enums/order-status.enum';
import { OrderDetailProductionStatus } from '../enums/order-detail-production-status.enum';

/**
 * Deriva el estado general de un pedido a partir del estado de producción
 * de sus líneas: pasa a IN_PROCESS en cuanto una línea arranca, a DONE solo
 * cuando TODAS las líneas están listas. Nunca sobrescribe DELIVERED/CANCELED
 * (son acciones explícitas de admin, ajenas a la producción).
 */
export function computeDerivedOrderStatus(
  currentStatus: OrderStatus,
  detailStatuses: OrderDetailProductionStatus[],
): OrderStatus {
  if (
    currentStatus === OrderStatus.DELIVERED ||
    currentStatus === OrderStatus.CANCELED
  ) {
    return currentStatus;
  }

  if (detailStatuses.length === 0) return currentStatus;

  const allDone = detailStatuses.every(
    (s) => s === OrderDetailProductionStatus.DONE,
  );
  if (allDone) return OrderStatus.DONE;

  const anyStarted = detailStatuses.some(
    (s) =>
      s === OrderDetailProductionStatus.IN_PROCESS ||
      s === OrderDetailProductionStatus.DONE,
  );
  if (anyStarted) return OrderStatus.IN_PROCESS;

  return OrderStatus.CREATED;
}
