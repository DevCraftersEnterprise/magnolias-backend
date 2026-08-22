import { computeDerivedOrderStatus } from './recompute-order-status.util';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderDetailProductionStatus } from '../enums/order-detail-production-status.enum';

describe('computeDerivedOrderStatus', () => {
  it('mantiene CREATED cuando no hay líneas', () => {
    expect(computeDerivedOrderStatus(OrderStatus.CREATED, [])).toBe(
      OrderStatus.CREATED,
    );
  });

  it('mantiene CREATED cuando todas las líneas están PENDING', () => {
    expect(
      computeDerivedOrderStatus(OrderStatus.CREATED, [
        OrderDetailProductionStatus.PENDING,
        OrderDetailProductionStatus.PENDING,
      ]),
    ).toBe(OrderStatus.CREATED);
  });

  it('pasa a IN_PROCESS en cuanto una línea arranca', () => {
    expect(
      computeDerivedOrderStatus(OrderStatus.CREATED, [
        OrderDetailProductionStatus.PENDING,
        OrderDetailProductionStatus.IN_PROCESS,
      ]),
    ).toBe(OrderStatus.IN_PROCESS);
  });

  it('pasa a IN_PROCESS si al menos una línea ya está DONE pero no todas', () => {
    expect(
      computeDerivedOrderStatus(OrderStatus.IN_PROCESS, [
        OrderDetailProductionStatus.DONE,
        OrderDetailProductionStatus.PENDING,
      ]),
    ).toBe(OrderStatus.IN_PROCESS);
  });

  it('pasa a DONE solo cuando TODAS las líneas están DONE', () => {
    expect(
      computeDerivedOrderStatus(OrderStatus.IN_PROCESS, [
        OrderDetailProductionStatus.DONE,
        OrderDetailProductionStatus.DONE,
      ]),
    ).toBe(OrderStatus.DONE);
  });

  it('nunca sobrescribe DELIVERED, sin importar el estado de las líneas', () => {
    expect(
      computeDerivedOrderStatus(OrderStatus.DELIVERED, [
        OrderDetailProductionStatus.PENDING,
      ]),
    ).toBe(OrderStatus.DELIVERED);
  });

  it('nunca sobrescribe CANCELED, sin importar el estado de las líneas', () => {
    expect(
      computeDerivedOrderStatus(OrderStatus.CANCELED, [
        OrderDetailProductionStatus.DONE,
        OrderDetailProductionStatus.DONE,
      ]),
    ).toBe(OrderStatus.CANCELED);
  });
});
