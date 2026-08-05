import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { CreateOrderDetailTierDto } from '../dto/create-order-detail-tier.dto';
import { CreateOrderDetailDto } from '../dto/create-order-detail.dto';
import { Order } from '../entities/order.entity';

/**
 * Mapea un CreateOrderDetailTierDto a los datos de un OrderDetailTier listo
 * para pasar a `repository.create()`. Compartido entre la creación de un
 * OrderDetail nuevo (cascade insert) y el reemplazo de tiers en edición.
 */
export function mapOrderDetailTierData(
  tier: CreateOrderDetailTierDto,
  user: User,
) {
  return {
    position: tier.position,
    productSize: tier.productSize,
    customSize: tier.customSize,
    breadType: { id: tier.breadTypeId },
    filling: { id: tier.fillingId },
    frosting: { id: tier.frostingId },
    color: { id: tier.colorId },
    createdBy: user,
    updatedBy: user,
  };
}

/**
 * Construye los datos de un OrderDetail nuevo (para `repository.create()`)
 * a partir del DTO recibido. Compartido entre CreateOrderUseCase y la rama
 * de "detalle nuevo" de UpdateOrderUseCase.
 */
export function buildOrderDetailData(
  detailDto: CreateOrderDetailDto,
  order: Order,
  product: Product,
  user: User,
  discountAuthorizedById?: string,
) {
  const hasDiscount = (detailDto.discountPercent ?? 0) > 0;

  return {
    ...detailDto,
    breadType: { id: detailDto.breadTypeId },
    filling: { id: detailDto.fillingId },
    frosting: { id: detailDto.frostingId },
    style: { id: detailDto.styleId },
    color: { id: detailDto.colorId },
    tiers: detailDto.tiers?.map((tier) => mapOrderDetailTierData(tier, user)),
    order,
    product,
    createdBy: user,
    updatedBy: user,
    ...(hasDiscount && {
      discountAuthorizedBy: { id: discountAuthorizedById } as User,
      discountAuthorizedAt: new Date(),
    }),
  };
}
