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
import { EventServiceType } from '../../common/enums/event-service-type.enum';

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
  });
  const customers = await customerRepository.find({
    relations: { address: true },
  });
  const branches = await branchRepository.find();
  const products = await productRepository.find();
  const flavors = await flavorRepository.find();
  const fillings = await fillingRepository.find();
  const frostings = await frostingRepository.find();
  const styles = await styleRepository.find();
  const colors = await colorRepository.find();
  const breadTypes = await breadTypeRepository.find();
  const flowers = await flowerRepository.find();

  if (!adminUser) {
    console.log(
      '⚠️ No se encontró usuario administrador, omitiendo seed de pedidos',
    );
    return;
  }

  if (customers.length === 0) {
    console.log('⚠️ No se encontraron clientes, omitiendo seed de pedidos');
    return;
  }

  if (branches.length === 0) {
    console.log('⚠️ No se encontraron sucursales, omitiendo seed de pedidos');
    return;
  }

  if (products.length === 0) {
    console.log('⚠️ No se encontraron productos, omitiendo seed de pedidos');
    return;
  }

  if (flavors.length === 0 || fillings.length === 0 || frostings.length === 0) {
    console.log(
      '⚠️ No se encontraron catálogos básicos (sabores, rellenos, glaseados), omitiendo seed de pedidos',
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
      setupServiceCost: 50,
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
        receiverPhone: '3312345678',
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
        },
      ],
      flowers: [
        {
          flowerId: flowers[0].id,
          colorId: colors[0].id,
          quantity: 6,
          notes: 'Borde superior',
        },
        {
          flowerId: flowers[1].id,
          colorId: colors[1].id,
          quantity: 4,
          notes: 'Centro del pastel',
        },
      ],
    };

    const order1 = await ordersService.createOrder(createOrderDom1, adminUser);

    await ordersService.assignOrder(
      bakers[0].id,
      {
        orderId: order1.id,
        assignedDate: new Date(),
        notes: 'Pedido completo - prioridad alta',
      },
      adminUser,
    );

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
      ticketNumber: 'TKT-VIT-001',
      details: [
        {
          productSize: ProductSize.FIFTEEN_P,
          price: 450,
          quantity: 1,
          hasWriting: false,
          productId: products[0].id,
        },
      ],
    };

    const order2 = await ordersService.createOrder(createOrderVit1, adminUser);

    console.log(`✅ Pedido VITRINA MÍNIMO: ${order2.orderCode}`);
    createdCount++;
    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 3: DOMICILIO - ★★☆ SIN FLORES NI ESCRITURA ★★☆
    // ═══════════════════════════════════════════════════════════════════════
    const createOrderDom2: CreateOrderDto = {
      orderType: OrderType.DOMICILIO,
      deliveryRound: DeliveryRound.ROUND_2,
      deliveryDate: getFutureDate(4),
      deliveryTime: '16:00',
      readyTime: '14:00',
      advancePayment: 500,
      setupServiceCost: 50,
      paymentMethod: PaymentMethod.TRANSFER,
      transferAccount: 'BBVA 1234567890',
      ticketNumber: 'TKT-DOM-002',
      hasPhotoReference: false,
      customerId: customers[2].id,
      branchId: branches[2].id,
      deliveryAddress: {
        newAddress: {
          street: ' Calle Juárez',
          neighborhood: 'Col. Roma',
          number: '789',
          city: ' Guadalajara',
        },
        useCustomerAddress: false,
        reference: 'Frente al parque',
        receiverName: 'Carlos López',
        receiverPhone: '3398765432',
      },
      details: [
        {
          productSize: ProductSize.THIRTY_P,
          price: 980,
          quantity: 1,
          hasWriting: false,
          pipingLocation: PipingLocation.FULL_BORDER,
          notes: 'Pastel liso sin decoración especial',
          productId: products[1].id,
          flavorId: flavors[6].id,
          fillingId: fillings[10].id,
          frostingId: frostings[4].id,
        },
      ],
    };

    const order3 = await ordersService.createOrder(createOrderDom2, adminUser);

    await ordersService.assignOrder(
      bakers[0].id,
      { orderId: order3.id, assignedDate: new Date() },
      adminUser,
    );

    console.log(`✅ Pedido DOMICILIO SIN FLORES: ${order3.orderCode}`);
    createdCount++;
    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 4: EVENTO - ★★★ COMPLETO CON MÚLTIPLES DETALLES ★★★
    // ═══════════════════════════════════════════════════════════════════════
    const createOrderEvt1: CreateOrderDto = {
      orderType: OrderType.EVENTO,
      deliveryRound: DeliveryRound.ROUND_1,
      deliveryDate: getFutureDate(10),
      deliveryTime: '15:00',
      readyTime: '13:00',
      eventTime: '18:00',
      setupTime: '15:30',
      branchDepartureTime: '14:30',
      setupPersonName: 'Roberto Hernández',
      eventServices: [
        EventServiceType.DESSERT_TABLE,
        EventServiceType.CAKE,
        EventServiceType.CHEESE_TABLE,
        EventServiceType.PLATED,
      ],
      guestCount: 200,
      advancePayment: 12500,
      dessertsTotal: 18000,
      setupServiceCost: 5000,
      paymentMethod: PaymentMethod.MIXED,
      ticketNumber: 'TKT-EVT-001',
      requiresInvoice: true,
      hasPhotoReference: true,
      customerId: customers[3].id,
      branchId: branches[1].id,
      deliveryAddress: {
        saveAsCommonAddress: true,
        useCustomerAddress: false,
        commonAddressName: 'Salón de eventos "Villa Jardín"',
        newAddress: {
          street: 'Av. Patria',
          neighborhood: 'Col. Providencia',
          number: '1200',
          betweenStreets: 'Entre Av. Americas y López Mateos',
          city: 'Zapopan',
          postalCode: '45030',
        },
        deliveryNotes:
          'Estacionamiento por la parte trasera, montacargas disponible',
        receiverName: 'Coordinador del evento',
        receiverPhone: '3311112222',
      },
      details: [
        {
          productSize: ProductSize.CUSTOM,
          customSize: '200 personas',
          price: 8000,
          quantity: 1,
          hasWriting: true,
          writingText: 'Feliz Boda Ana y Carlos',
          writingLocation: WritingLocation.PLAQUE,
          pipingLocation: PipingLocation.FULL_BORDER,
          notes: 'Pastel principal de 4 pisos, diseño clásico elegante',
          productId: products[5].id,
          flavorId: flavors[2].id,
          fillingId: fillings[5].id,
          frostingId: frostings[3].id,
          styleId: styles[4].id,
          colorId: colors[17].id,
          breadTypeId: breadTypes[1].id,
        },
        {
          price: 35,
          quantity: 100,
          hasWriting: false,
          notes: 'Cupcakes decorados con iniciales A&C',
          productId: products[8].id,
          flavorId: flavors[4].id,
          fillingId: fillings[7].id,
          frostingId: frostings[2].id,
          colorId: colors[5].id,
        },
        {
          price: 25,
          quantity: 15,
          hasWriting: false,
          notes: 'Variedad de pan dulce tradicional',
          productId: products[9].id,
        },
        {
          price: 25,
          quantity: 10,
          hasWriting: false,
          notes: 'Variedad de pan dulce tradicional',
          productId: products[11].id,
        },
      ],
      flowers: [
        {
          flowerId: flowers[0].id,
          colorId: colors[17].id,
          quantity: 30,
          notes: 'Decoración del pastel principal',
        },
        {
          flowerId: flowers[4].id,
          colorId: colors[0].id,
          quantity: 20,
          notes: 'Para decoración adicional',
        },
        {
          flowerId: flowers[3].id,
          quantity: 15,
          notes: 'Para decoración adicional',
        },
      ],
    };

    const order4 = await ordersService.createOrder(createOrderEvt1, adminUser);

    await ordersService.assignOrder(
      bakers[4].id,
      { orderId: order4.id, assignedDate: new Date() },
      adminUser,
    );

    console.log(`✅ Pedido EVENTO COMPLETO: ${order4.orderCode}`);
    createdCount++;
    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 5: PERSONALIZADO - ★★☆ CON ESCRITURA PERO SIN PIPING ★★☆
    // ═══════════════════════════════════════════════════════════════════════
    const createCustomOrder1: CreateOrderDto = {
      orderType: OrderType.PERSONALIZADO,
      deliveryDate: getFutureDate(6),
      deliveryTime: '14:00',
      readyTime: '11:00',
      advancePayment: 1750,
      setupServiceCost: 50,
      paymentMethod: PaymentMethod.CARD,
      ticketNumber: 'TKT-PER-001',
      hasPhotoReference: true,
      requiresInvoice: true,
      customerId: customers[3].id,
      branchId: branches[0].id,
      deliveryAddress: {
        useCustomerAddress: false,
        newAddress: {
          street: 'Av. Vallarta',
          number: '2500',
          neighborhood: 'Arcos Vallarta',
          city: 'Guadalajara',
          postalCode: '44130',
        },
        receiverName: 'Empresa XYZ - Recepción',
        receiverPhone: '3344556677',
      },
      details: [
        {
          productSize: ProductSize.CUSTOM,
          customSize: '80 personas',
          price: 3500,
          quantity: 1,
          hasWriting: true,
          writingText: 'Felicitaciones Equipo 2026',
          writingLocation: WritingLocation.CENTER,
          notes: 'Diseño corporativo con logo impreso en oblea',
          productId: products[0].id,
          flavorId: flavors[0].id,
          fillingId: fillings[4].id,
          frostingId: frostings[4].id,
          styleId: styles[0].id,
          colorId: colors[8].id,
        },
      ],
      flowers: [{ flowerId: flowers[0].id, quantity: 3 }],
    };

    const order5 = await ordersService.createOrder(
      createCustomOrder1,
      adminUser,
    );

    // await ordersService.assignOrder(bakers[4].id, { orderId: order5.id, assignedDate: new Date() }, adminUser);

    console.log(`✅ Pedido PERSONALIZADO: ${order5.orderCode}`);
    createdCount++;
  } catch (error) {
    console.error('❌ Error al crear pedidos:', error);
  }

  console.log(`📊 Total pedidos creados: ${createdCount}\n`);
}
