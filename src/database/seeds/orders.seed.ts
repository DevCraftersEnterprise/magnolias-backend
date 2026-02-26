import { Repository } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { Color } from '../../colors/entities/color.entity';
import { DeliveryRound } from '../../common/enums/delivery-round.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { PaymentMethod } from '../../common/enums/payment-methods.enum';
import { PipingLocation } from '../../common/enums/piping-location.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { WritingLocation } from '../../common/enums/writing-location.enum';
import { Customer } from '../../customers/entities/customer.entity';
import { Filling } from '../../fillings/entities/filling.entity';
import { Flavor } from '../../flavors/entities/flavor.entity';
import { Flower } from '../../flowers/entities/flower.entity';
import { Frosting } from '../../frostings/entities/frosting.entity';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';
import { OrdersService } from '../../orders/orders.service';
import { Product } from '../../products/entities/product.entity';
import { Style } from '../../styles/entities/style.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedOrders(
  ordersService: OrdersService,
  customerRepository: Repository<Customer>,
  branchRepository: Repository<Branch>,
  productRepository: Repository<Product>,
  userRepository: Repository<User>,
  flavorRepository: Repository<Flavor>,
  fillingRepository: Repository<Filling>,
  frostingRepository: Repository<Frosting>,
  styleRepository: Repository<Style>,
  colorRepository: Repository<Color>,
  breadTypeRepository: Repository<BreadType>,
  flowerRepository: Repository<Flower>,
): Promise<void> {
  console.log('📦 Iniciando seed de pedidos...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  const bakers = await userRepository.find({
    where: { role: UserRoles.BAKER },
  })

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de pedidos',
    );
    return;
  }

  // Obtener clientes existentes
  const customers = await customerRepository.find({
    relations: { address: true },
    take: 5,
  });

  if (customers.length === 0) {
    console.log('   ⚠️  No se encontraron clientes, omitiendo seed de pedidos');
    return;
  }

  // Obtener sucursales existentes
  const branches = await branchRepository.find({ take: 2 });

  if (branches.length === 0) {
    console.log(
      '   ⚠️  No se encontraron sucursales, omitiendo seed de pedidos',
    );
    return;
  }

  // Obtener productos existentes
  const products = await productRepository.find({ take: 10 });

  if (products.length === 0) {
    console.log(
      '   ⚠️  No se encontraron productos, omitiendo seed de pedidos',
    );
    return;
  }

  // Obtener catálogos
  const flavors = await flavorRepository.find();
  const fillings = await fillingRepository.find();
  const frostings = await frostingRepository.find();
  const styles = await styleRepository.find();
  const colors = await colorRepository.find();
  const breadTypes = await breadTypeRepository.find();
  const flowers = await flowerRepository.find();

  if (flavors.length === 0 || fillings.length === 0 || frostings.length === 0) {
    console.log(
      '   ⚠️  No se encontraron catálogos básicos (sabores, rellenos, glaseados), omitiendo seed de pedidos',
    );
    return;
  }
  let createdCount = 0;

  // Helpers
  const getFutureDate = (daysFromNow: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 1: DOMICILIO - ★★★ COMPLETO - TODOS LOS CAMPOS ★★★
    // ═══════════════════════════════════════════════════════════════════════    
    const createOrderDom1: CreateOrderDto = {
      orderType: OrderType.DOMICILIO,
      deliveryRound: DeliveryRound.ROUND_1,
      deliveryDate: getFutureDate(3),
      deliveryTime: '14:00',
      readyTime: '12:00',
      advancePayment: 400,
      paymentMethod: PaymentMethod.CASH,
      ticketNumber: 'TKT-DOM-001',
      hasPhotoReference: true,
      customerId: customers[0].id,
      branchId: branches[0].id,
      deliveryAddress: {
        useCustomerAddress: true,
        betweenStreets: 'Entre Calle 5 y Calle 7',
        interphoneCode: '1234#',
        deliveryNotes: 'Tocar el timbre 2 veces',
        reference: 'Casa azul con portón negro',
        receiverName: 'María García',
        receiverPhone: '3312345678'
      },
      details: [
        {
          productSize: ProductSize.TWENTY_P,
          price: 850,
          quantity: 1,
          hasWriting: true,
          writingText: 'Feliz Cumpleaños Ana',
          writingLocation: WritingLocation.TOP,
          pipingLocation: PipingLocation.TOP_BORDER,
          decorationNotes: 'Decoración con flores de azúcar, diseño elegante',
          notes: 'Incluir en el relleno chispas de chocolate',
          productId: products[0].id,
          breadTypeId: breadTypes[0].id,
          colorId: colors[0].id,
          fillingId: fillings[0].id,
          flavorId: flavors[0].id,
          frostingId: frostings[0].id,
          styleId: styles[0].id,
        }
      ],
      flowers: [
        { flowerId: flowers[0].id, colorId: colors[0].id, quantity: 6, notes: 'Borde superior' },
        { flowerId: flowers[1].id, colorId: colors[1].id, quantity: 4, notes: 'Centro del pastel' },
      ]
    };

    const order1 = await ordersService.createOrder(createOrderDom1, adminUser);

    await ordersService.assignOrder(bakers[0].id, { orderId: order1.id, assignedDate: new Date(), notes: 'Pedido completo - prioridad alta' }, adminUser)

    console.log(`✅ Pedido DOMICILIO COMPLETO: ${order1.orderCode}`);
    createdCount++;
    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 2: VITRINA - ★☆☆ MÍNIMO - SOLO CAMPOS REQUERIDOS ★☆☆
    // ═══════════════════════════════════════════════════════════════════════
    const createOrderVit1: CreateOrderDto = {
      orderType: OrderType.VITRINA,
      deliveryDate: getFutureDate(1),
      advancePayment: 225,
      customerId: customers[1].id,
      branchId: branches[1].id,
      details: [
        {
          productSize: ProductSize.FIFTEEN_P,
          price: 450,
          quantity: 1,
          hasWriting: false,
          productId: products[0].id,
        }
      ]
    }

    const order2 = await ordersService.createOrder(createOrderVit1, adminUser);

    console.log(`✅ Pedido VITRINA MÍNIMO: ${order2.orderCode}`);
    createdCount++;
  } catch (error) {
    console.error('   ❌ Error al crear pedidos:', error);
  }

  console.log(`   📊 Total pedidos creados: ${createdCount}\n`);
}
