import { Between, Repository } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Order } from '../entities/order.entity';

export function getOrderTypePrefix(flags: {
  isEvento: boolean;
  isEnTienda: boolean;
}): string {
  if (flags.isEvento) return 'EVE';
  if (flags.isEnTienda) return 'VIT';
  return 'DOM';
}

export async function generateOrderCode(
  orderRepository: Repository<Order>,
  flags: { isEvento: boolean; isEnTienda: boolean },
  branch: Branch,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = getOrderTypePrefix(flags);

  const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const lastOrder = await orderRepository.findOne({
    where: {
      isEvento: flags.isEvento,
      isEnTienda: flags.isEnTienda,
      branch: { id: branch.id },
      createdAt: Between(startOfYear, endOfYear),
    },
    order: { createdAt: 'DESC' },
    select: {
      id: true,
      orderCode: true,
      createdAt: true,
    },
  });

  let sequence = 1;

  if (lastOrder?.orderCode) {
    const parts = lastOrder.orderCode.split('-');
    if (parts.length === 4) {
      const lastSequence = parseInt(parts[3], 10);
      if (!Number.isNaN(lastSequence)) sequence = lastSequence + 1;
    }
  }

  return `${prefix}-${branch.name.toUpperCase().replace(' ', '-')}-${year}-${sequence.toString().padStart(4, '0')}`;
}
