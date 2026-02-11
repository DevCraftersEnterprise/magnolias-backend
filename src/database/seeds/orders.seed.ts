import { DataSource } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { DeliveryRound } from '../../common/enums/delivery-round.enum';
import { EventServiceType } from '../../common/enums/event-service-type.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { PaymentMethod } from '../../common/enums/payment-methods.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderDeliveryAddress } from '../../orders/entities/order-delivery-address.entity';
import { OrderDetail } from '../../orders/entities/order-detail.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedOrders(dataSource: DataSource): Promise<void> {
  console.log('📦 Iniciando seed de pedidos...');

  const orderRepository = dataSource.getRepository(Order);
  const orderDetailRepository = dataSource.getRepository(OrderDetail);
  const orderDeliveryAddressRepository =
    dataSource.getRepository(OrderDeliveryAddress);
  const customerRepository = dataSource.getRepository(Customer);
  const branchRepository = dataSource.getRepository(Branch);
  const productRepository = dataSource.getRepository(Product);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

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
  const products = await productRepository.find({ take: 6 });

  if (products.length === 0) {
    console.log(
      '   ⚠️  No se encontraron productos, omitiendo seed de pedidos',
    );
    return;
  }

  const branch = branches[0];
  let createdCount = 0;

  // Helper para generar fechas futuras
  const getFutureDate = (daysFromNow: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 1: DOMICILIO
    // ═══════════════════════════════════════════════════════════════════════
    const customer1 = customers[0];
    const domicilioOrder = orderRepository.create({
      orderType: OrderType.DOMICILIO,
      orderCode: 'DOM-2026-0001',
      deliveryRound: DeliveryRound.ROUND_1,
      productSize: ProductSize.TWENTY_P,
      deliveryDate: getFutureDate(3),
      deliveryTime: '14:00',
      readyTime: '12:00',
      totalAmount: 850,
      advancePayment: 400,
      remainingBalance: 450,
      paymentMethod: PaymentMethod.CASH,
      ticketNumber: 'TKT-DOM-001',
      hasPhotoReference: true,
      status: OrderStatus.CREATED,
      customer: customer1,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedDomicilioOrder = await orderRepository.save(domicilioOrder);

    // Crear dirección de entrega para domicilio
    const domicilioAddress = orderDeliveryAddressRepository.create({
      street: customer1.address?.street || 'Av. Revolución',
      number: customer1.address?.number || '456',
      neighborhood: customer1.address?.neighborhood || 'Col. Centro',
      city: customer1.address?.city || 'Guadalajara',
      postalCode: '44100',
      betweenStreets: 'Entre Calle 5 y Calle 7',
      reference: 'Casa azul con portón negro',
      deliveryNotes: 'Tocar el timbre 2 veces',
      receiverName: 'María García',
      receiverPhone: '3312345678',
      order: savedDomicilioOrder,
    });
    await orderDeliveryAddressRepository.save(domicilioAddress);

    // Detalles del pedido domicilio
    const domicilioDetail = orderDetailRepository.create({
      price: 850,
      quantity: 1,
      hasWriting: true,
      writingText: 'Feliz Cumpleaños Ana',
      notes: 'Decoración con flores de azúcar',
      product: products[0],
      order: savedDomicilioOrder,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(domicilioDetail);

    console.log('   ✅ Pedido DOMICILIO creado: DOM-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 2: EVENTO
    // ═══════════════════════════════════════════════════════════════════════
    const customer2 = customers[1] || customers[0];
    const eventoOrder = orderRepository.create({
      orderType: OrderType.EVENTO,
      orderCode: 'EVT-2026-0001',
      deliveryRound: DeliveryRound.ROUND_2,
      productSize: ProductSize.CUSTOM,
      customSize: '150 personas',
      deliveryDate: getFutureDate(7),
      deliveryTime: '16:00',
      readyTime: '14:00',
      eventTime: '18:00',
      setupTime: '16:30',
      branchDepartureTime: '15:30',
      setupPersonName: 'Juan Pérez',
      eventServices: [
        EventServiceType.DESSERT_TABLE,
        EventServiceType.CAKE,
        EventServiceType.CHEESE_TABLE,
      ],
      guestCount: 150,
      totalAmount: 15000,
      advancePayment: 7500,
      remainingBalance: 7500,
      dessertsTotal: 12000,
      setupServiceCost: 3000,
      paymentMethod: PaymentMethod.TRANSFER,
      transferAccount: 'BBVA 0123456789',
      ticketNumber: 'TKT-EVT-001',
      requiresInvoice: true,
      hasPhotoReference: true,
      status: OrderStatus.CREATED,
      customer: customer2,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedEventoOrder = await orderRepository.save(eventoOrder);

    // Crear dirección del evento
    const eventoAddress = orderDeliveryAddressRepository.create({
      street: 'Av. Patria',
      number: '1200',
      neighborhood: 'Col. Providencia',
      city: 'Zapopan',
      postalCode: '45030',
      betweenStreets: 'Entre Av. Americas y Av. Mexico',
      reference: 'Salón de eventos "El Jardín"',
      deliveryNotes: 'Entrada por el estacionamiento trasero',
      receiverName: 'Roberto Hernández',
      receiverPhone: '3398765432',
      order: savedEventoOrder,
    });
    await orderDeliveryAddressRepository.save(eventoAddress);

    // Detalles del pedido evento (múltiples productos)
    const eventoDetails = [
      {
        price: 5000,
        quantity: 1,
        hasWriting: true,
        writingText: 'Feliz Boda Ana y Carlos',
        notes: 'Pastel principal de 3 pisos',
        product: products[0],
      },
      {
        price: 2500,
        quantity: 50,
        hasWriting: false,
        notes: 'Cupcakes decorados tema floral',
        product: products[1] || products[0],
      },
      {
        price: 4500,
        quantity: 1,
        hasWriting: false,
        notes: 'Mesa de quesos importados',
        product: products[2] || products[0],
      },
    ];

    for (const detail of eventoDetails) {
      const orderDetail = orderDetailRepository.create({
        ...detail,
        order: savedEventoOrder,
        createdBy: adminUser,
        updatedBy: adminUser,
      });
      await orderDetailRepository.save(orderDetail);
    }

    console.log('   ✅ Pedido EVENTO creado: EVT-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 3: VITRINA
    // ═══════════════════════════════════════════════════════════════════════
    const customer3 = customers[2] || customers[0];
    const vitrinaOrder = orderRepository.create({
      orderType: OrderType.VITRINA,
      orderCode: 'VIT-2026-0001',
      productSize: ProductSize.TWENTY_P,
      deliveryDate: getFutureDate(1),
      deliveryTime: '11:00',
      readyTime: '10:00',
      totalAmount: 650,
      advancePayment: 325,
      remainingBalance: 325,
      paidAmount: 0,
      paymentMethod: PaymentMethod.CARD,
      ticketNumber: 'TKT-VIT-001',
      hasPhotoReference: false,
      status: OrderStatus.CREATED,
      customer: customer3,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedVitrinaOrder = await orderRepository.save(vitrinaOrder);

    // Detalle del pedido vitrina
    const vitrinaDetail = orderDetailRepository.create({
      price: 650,
      quantity: 1,
      hasWriting: true,
      writingText: 'Felices 15 años Sofía',
      notes:
        'Cambiar relleno por fresas con crema, decoración extra con chispas',
      product: products[3] || products[0],
      order: savedVitrinaOrder,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(vitrinaDetail);

    console.log('   ✅ Pedido VITRINA creado: VIT-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 4: PERSONALIZADO
    // ═══════════════════════════════════════════════════════════════════════
    const customer4 = customers[3] || customers[0];
    const personalizadoOrder = orderRepository.create({
      orderType: OrderType.PERSONALIZADO,
      orderCode: 'PER-2026-0001',
      productSize: ProductSize.CUSTOM,
      customSize: '50 personas',
      deliveryDate: getFutureDate(5),
      deliveryTime: '15:00',
      readyTime: '13:00',
      totalAmount: 2500,
      advancePayment: 1250,
      remainingBalance: 1250,
      paymentMethod: PaymentMethod.MIXED,
      ticketNumber: 'TKT-PER-001',
      hasPhotoReference: true,
      requiresInvoice: false,
      status: OrderStatus.CREATED,
      customer: customer4,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedPersonalizadoOrder =
      await orderRepository.save(personalizadoOrder);

    // Crear dirección de entrega para personalizado (cliente recoge en sucursal pero dejar datos)
    const personalizadoAddress = orderDeliveryAddressRepository.create({
      street: 'Av. Vallarta',
      number: '3500',
      neighborhood: 'Col. Arcos Vallarta',
      city: 'Guadalajara',
      postalCode: '44130',
      reference: 'Oficinas corporativas piso 5',
      deliveryNotes: 'Entregar en recepción',
      receiverName: 'Luis Martínez',
      receiverPhone: '3345678901',
      order: savedPersonalizadoOrder,
    });
    await orderDeliveryAddressRepository.save(personalizadoAddress);

    // Detalle del pedido personalizado
    const personalizadoDetail = orderDetailRepository.create({
      price: 2500,
      quantity: 1,
      hasWriting: true,
      writingText: 'Gracias Equipo de Ventas 2026',
      notes:
        'Diseño corporativo con logo de la empresa, colores azul y blanco, forma rectangular',
      referenceImageUrl: 'https://example.com/reference/corporate-cake.jpg',
      product: products[4] || products[0],
      order: savedPersonalizadoOrder,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(personalizadoDetail);

    console.log('   ✅ Pedido PERSONALIZADO creado: PER-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 5: DOMICILIO adicional (para más pruebas)
    // ═══════════════════════════════════════════════════════════════════════
    const customer5 = customers[4] || customers[0];
    const domicilioOrder2 = orderRepository.create({
      orderType: OrderType.DOMICILIO,
      orderCode: 'DOM-2026-0002',
      deliveryRound: DeliveryRound.ROUND_3,
      productSize: ProductSize.THIRTY_P,
      deliveryDate: getFutureDate(2),
      deliveryTime: '18:00',
      readyTime: '16:00',
      totalAmount: 1200,
      advancePayment: 600,
      remainingBalance: 600,
      paymentMethod: PaymentMethod.TRANSFER,
      transferAccount: 'Santander 9876543210',
      ticketNumber: 'TKT-DOM-002',
      hasPhotoReference: true,
      status: OrderStatus.IN_PROCESS,
      customer: customer5,
      branch: branches[1] || branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedDomicilioOrder2 = await orderRepository.save(domicilioOrder2);

    // Dirección de entrega
    const domicilio2Address = orderDeliveryAddressRepository.create({
      street: 'Calle López Mateos',
      number: '890',
      neighborhood: 'Col. Chapalita',
      city: 'Guadalajara',
      postalCode: '44500',
      interphoneCode: '2345#',
      betweenStreets: 'Entre Tepeyac y Av. Niños Héroes',
      reference: 'Edificio gris, depto 4B',
      deliveryNotes: 'Llamar 15 min antes de llegar',
      receiverName: 'Patricia Sánchez',
      receiverPhone: '3356789012',
      order: savedDomicilioOrder2,
    });
    await orderDeliveryAddressRepository.save(domicilio2Address);

    // Detalles
    const domicilio2Details = [
      {
        price: 800,
        quantity: 1,
        hasWriting: true,
        writingText: 'Feliz Aniversario',
        notes: 'Pastel de chocolate con fresas',
        product: products[2] || products[0],
      },
      {
        price: 400,
        quantity: 12,
        hasWriting: false,
        notes: 'Cupcakes variados',
        product: products[1] || products[0],
      },
    ];

    for (const detail of domicilio2Details) {
      const orderDetail = orderDetailRepository.create({
        ...detail,
        order: savedDomicilioOrder2,
        createdBy: adminUser,
        updatedBy: adminUser,
      });
      await orderDetailRepository.save(orderDetail);
    }

    console.log('   ✅ Pedido DOMICILIO creado: DOM-2026-0002');
    createdCount++;
  } catch (error) {
    console.error('   ❌ Error al crear pedidos:', error);
  }

  console.log(`   📊 Total pedidos creados: ${createdCount}\n`);
}
