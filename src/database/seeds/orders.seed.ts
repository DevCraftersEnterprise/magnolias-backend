import { DataSource } from 'typeorm';
import { Baker } from '../../bakers/entities/baker.entity';
import { OrderAssignment } from '../../bakers/entities/order-assignment.entity';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Color } from '../../colors/entities/color.entity';
import { DeliveryRound } from '../../common/enums/delivery-round.enum';
import { EventServiceType } from '../../common/enums/event-service-type.enum';
import { OrderType } from '../../common/enums/order-type.enum';
import { PaymentMethod } from '../../common/enums/payment-methods.enum';
import { PipingLocation } from '../../common/enums/piping-location.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { WritingLocation } from '../../common/enums/writing-location.enum';
import { Customer } from '../../customers/entities/customer.entity';
import { Filling } from '../../fillings/entities/filling.entity';
import { Flavor } from '../../flavors/entities/flavor.entity';
import { Flower } from '../../flowers/entities/flower.entity';
import { OrderFlower } from '../../flowers/entities/order-flower.entity';
import { Frosting } from '../../frostings/entities/frosting.entity';
import { OrderDeliveryAddress } from '../../orders/entities/order-delivery-address.entity';
import { OrderDetail } from '../../orders/entities/order-detail.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { Product } from '../../products/entities/product.entity';
import { Style } from '../../styles/entities/style.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedOrders(dataSource: DataSource): Promise<void> {
  console.log('📦 Iniciando seed de pedidos...');

  const orderRepository = dataSource.getRepository(Order);
  const orderDetailRepository = dataSource.getRepository(OrderDetail);
  const orderDeliveryAddressRepository =
    dataSource.getRepository(OrderDeliveryAddress);
  const orderFlowerRepository = dataSource.getRepository(OrderFlower);
  const orderAssignmentRepository = dataSource.getRepository(OrderAssignment);
  const customerRepository = dataSource.getRepository(Customer);
  const branchRepository = dataSource.getRepository(Branch);
  const productRepository = dataSource.getRepository(Product);
  const userRepository = dataSource.getRepository(User);
  const flavorRepository = dataSource.getRepository(Flavor);
  const fillingRepository = dataSource.getRepository(Filling);
  const frostingRepository = dataSource.getRepository(Frosting);
  const styleRepository = dataSource.getRepository(Style);
  const colorRepository = dataSource.getRepository(Color);
  const breadTypeRepository = dataSource.getRepository(BreadType);
  const flowerRepository = dataSource.getRepository(Flower);
  const bakerRepository = dataSource.getRepository(Baker);

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
  const bakers = await bakerRepository.find();

  if (flavors.length === 0 || fillings.length === 0 || frostings.length === 0) {
    console.log(
      '   ⚠️  No se encontraron catálogos básicos (sabores, rellenos, glaseados), omitiendo seed de pedidos',
    );
    return;
  }

  const branch = branches[0];
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
    const customer1 = customers[0];
    const domicilioCompleto = orderRepository.create({
      orderType: OrderType.DOMICILIO,
      orderCode: 'DOM-2026-0001',
      deliveryRound: DeliveryRound.ROUND_1,
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

    const savedDomicilioCompleto =
      await orderRepository.save(domicilioCompleto);

    // Dirección COMPLETA
    const domicilioCompletoAddress = orderDeliveryAddressRepository.create({
      street: customer1.address?.street || 'Av. Revolución',
      number: customer1.address?.number || '456',
      neighborhood: customer1.address?.neighborhood || 'Col. Centro',
      city: customer1.address?.city || 'Guadalajara',
      postalCode: '44100',
      interphoneCode: '1234#',
      betweenStreets: 'Entre Calle 5 y Calle 7',
      reference: 'Casa azul con portón negro',
      deliveryNotes: 'Tocar el timbre 2 veces',
      receiverName: 'María García',
      receiverPhone: '3312345678',
      order: savedDomicilioCompleto,
    });
    await orderDeliveryAddressRepository.save(domicilioCompletoAddress);

    // Detalle COMPLETO - absolutamente todos los campos
    const domicilioCompletoDetail = orderDetailRepository.create({
      productSize: ProductSize.TWENTY_P,
      price: 850,
      quantity: 1,
      hasWriting: true,
      writingText: 'Feliz Cumpleaños Ana',
      writingLocation: WritingLocation.TOP,
      pipingLocation: PipingLocation.TOP_BORDER,
      notes: 'Decoración con flores de azúcar, diseño elegante',
      referenceImageUrl: 'https://example.com/reference/birthday-cake.jpg',
      product: products[0],
      flavor: flavors[0],
      filling: fillings[0],
      frosting: frostings[0],
      style: styles[0],
      color: colors[0],
      breadType: breadTypes[0], // Vainilla
      order: savedDomicilioCompleto,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(domicilioCompletoDetail);

    // Múltiples flores
    const floresCompletas = [
      {
        flower: flowers[0],
        color: colors[0],
        quantity: 6,
        notes: 'Borde superior',
      },
      {
        flower: flowers[1],
        color: colors[1],
        quantity: 4,
        notes: 'Centro del pastel',
      },
    ];
    for (const f of floresCompletas) {
      await orderFlowerRepository.save(
        orderFlowerRepository.create({
          ...f,
          order: savedDomicilioCompleto,
          createdBy: adminUser,
          updatedBy: adminUser,
        }),
      );
    }

    // Asignación de pastelero
    await orderAssignmentRepository.save(
      orderAssignmentRepository.create({
        order: savedDomicilioCompleto,
        baker: bakers[0],
        assignedDate: new Date(),
        notes: 'Pedido completo - prioridad alta',
        createdBy: adminUser,
        updatedBy: adminUser,
      }),
    );

    console.log('   ✅ Pedido DOMICILIO COMPLETO: DOM-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 2: VITRINA - ★☆☆ MÍNIMO - SOLO CAMPOS REQUERIDOS ★☆☆
    // ═══════════════════════════════════════════════════════════════════════
    const customer2 = customers[1] || customers[0];
    const vitrinaMinimo = orderRepository.create({
      orderType: OrderType.VITRINA,
      orderCode: 'VIT-2026-0001',
      deliveryDate: getFutureDate(1),
      totalAmount: 450,
      advancePayment: 225,
      remainingBalance: 225,
      status: OrderStatus.CREATED,
      customer: customer2,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
      // SIN: deliveryTime, readyTime, paymentMethod, ticketNumber, hasPhotoReference
    });

    const savedVitrinaMinimo = await orderRepository.save(vitrinaMinimo);

    // Detalle MÍNIMO - solo campos obligatorios
    const vitrinaMinimoDetail = orderDetailRepository.create({
      productSize: ProductSize.FIFTEEN_P,
      price: 450,
      quantity: 1,
      hasWriting: false,
      // SIN: writingText, writingLocation, pipingLocation, notes, referenceImageUrl
      // SIN: flavor, filling, frosting, style, color, breadType
      product: products[0],
      order: savedVitrinaMinimo,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(vitrinaMinimoDetail);

    // SIN flores, SIN asignación de pastelero
    console.log('   ✅ Pedido VITRINA MÍNIMO: VIT-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 3: DOMICILIO - ★★☆ SIN FLORES NI ESCRITURA ★★☆
    // ═══════════════════════════════════════════════════════════════════════
    const customer3 = customers[2] || customers[0];
    const domicilioSinFlores = orderRepository.create({
      orderType: OrderType.DOMICILIO,
      orderCode: 'DOM-2026-0002',
      deliveryRound: DeliveryRound.ROUND_2,
      deliveryDate: getFutureDate(4),
      deliveryTime: '16:00',
      readyTime: '14:00',
      totalAmount: 980,
      advancePayment: 500,
      remainingBalance: 480,
      paymentMethod: PaymentMethod.TRANSFER,
      transferAccount: 'BBVA 1234567890',
      ticketNumber: 'TKT-DOM-002',
      hasPhotoReference: false, // Sin foto de referencia
      status: OrderStatus.IN_PROCESS,
      customer: customer3,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedDomicilioSinFlores =
      await orderRepository.save(domicilioSinFlores);

    // Dirección parcial
    const domicilioSinFloresAddress = orderDeliveryAddressRepository.create({
      street: 'Calle Juárez',
      number: '789',
      neighborhood: 'Col. Roma',
      city: 'Guadalajara',
      // SIN: postalCode, interphoneCode, betweenStreets
      reference: 'Frente al parque',
      receiverName: 'Carlos López',
      receiverPhone: '3398765432',
      order: savedDomicilioSinFlores,
    });
    await orderDeliveryAddressRepository.save(domicilioSinFloresAddress);

    // Detalle SIN escritura, con sabor y relleno, sin estilo ni color
    const domicilioSinFloresDetail = orderDetailRepository.create({
      productSize: ProductSize.THIRTY_P,
      price: 980,
      quantity: 1,
      hasWriting: false, // Sin escritura
      pipingLocation: PipingLocation.FULL_BORDER,
      notes: 'Pastel liso sin decoración especial',
      product: products[1] || products[0],
      flavor: flavors[1], // Vainilla
      filling: fillings[1], // Ganache
      frosting: frostings[1], // Buttercream Italiano
      // SIN: style, color, breadType
      order: savedDomicilioSinFlores,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(domicilioSinFloresDetail);

    // SIN flores
    // CON asignación de pastelero
    if (bakers.length > 1) {
      await orderAssignmentRepository.save(
        orderAssignmentRepository.create({
          order: savedDomicilioSinFlores,
          baker: bakers[1],
          assignedDate: new Date(),
          createdBy: adminUser,
          updatedBy: adminUser,
        }),
      );
    }

    console.log('   ✅ Pedido DOMICILIO SIN FLORES: DOM-2026-0002');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 4: EVENTO - ★★★ COMPLETO CON MÚLTIPLES DETALLES ★★★
    // ═══════════════════════════════════════════════════════════════════════
    const customer4 = customers[3] || customers[0];
    const eventoCompleto = orderRepository.create({
      orderType: OrderType.EVENTO,
      orderCode: 'EVT-2026-0001',
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
      totalAmount: 25000,
      advancePayment: 12500,
      remainingBalance: 12500,
      dessertsTotal: 18000,
      setupServiceCost: 5000,
      paymentMethod: PaymentMethod.MIXED,
      ticketNumber: 'TKT-EVT-001',
      settlementTicketNumber: 'TKT-EVT-001-LIQ',
      requiresInvoice: true,
      hasPhotoReference: true,
      status: OrderStatus.CREATED,
      customer: customer4,
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedEventoCompleto = await orderRepository.save(eventoCompleto);

    // Dirección del evento COMPLETA
    const eventoAddress = orderDeliveryAddressRepository.create({
      street: 'Av. Patria',
      number: '1200',
      neighborhood: 'Col. Providencia',
      city: 'Zapopan',
      postalCode: '45030',
      betweenStreets: 'Entre Av. Americas y López Mateos',
      reference: 'Salón de eventos "Villa Jardín", entrada principal',
      deliveryNotes:
        'Estacionamiento por la parte trasera, montacargas disponible',
      receiverName: 'Coordinador del evento',
      receiverPhone: '3311112222',
      order: savedEventoCompleto,
    });
    await orderDeliveryAddressRepository.save(eventoAddress);

    // MÚLTIPLES detalles con diferentes configuraciones
    const eventoDetalles = [
      {
        // Pastel principal - COMPLETO
        productSize: ProductSize.CUSTOM,
        customSize: '200 personas',
        price: 8000,
        quantity: 1,
        hasWriting: true,
        writingText: 'Feliz Boda Ana y Carlos',
        writingLocation: WritingLocation.PLAQUE,
        pipingLocation: PipingLocation.FULL_BORDER,
        notes: 'Pastel principal de 4 pisos, diseño clásico elegante',
        referenceImageUrl: 'https://example.com/wedding-cake.jpg',
        product: products[0],
        flavor: flavors[0], // Chocolate
        filling: fillings[2], // Mermelada de fresa
        frosting: frostings[0], // Buttercream Suizo
        style: styles[1] || styles[0], // Rústico
        color: colors[17] || colors[0], // Blanco
        breadType: breadTypes[0],
      },
      {
        // Cupcakes - parcial
        price: 3500,
        quantity: 100,
        hasWriting: false,
        notes: 'Cupcakes decorados con iniciales A&C',
        product: products[1] || products[0],
        flavor: flavors[1], // Vainilla
        filling: fillings[5] || fillings[0], // Chantilly
        frosting: frostings[2], // Buttercream Americano
        color: colors[0], // Rosa pastel
        // SIN: writingLocation, pipingLocation, style, breadType, referenceImageUrl
      },
      {
        // Mesa de postres - mínimo
        price: 5000,
        quantity: 1,
        hasWriting: false,
        notes: 'Mesa de postres variados',
        product: products[2] || products[0],
        // Solo producto y notas
      },
      {
        // Pan para evento - con breadType
        price: 2500,
        quantity: 50,
        hasWriting: false,
        notes: 'Variedad de pan dulce tradicional',
        product: products[3] || products[0],
        breadType: breadTypes[1] || breadTypes[0], // Chocolate
        // Sin otros catálogos de pastel
      },
    ];

    for (const detalle of eventoDetalles) {
      await orderDetailRepository.save(
        orderDetailRepository.create({
          ...detalle,
          order: savedEventoCompleto,
          createdBy: adminUser,
          updatedBy: adminUser,
        }),
      );
    }

    // Flores variadas
    if (flowers.length >= 4) {
      const floresEvento = [
        {
          flower: flowers[0],
          color: colors[17] || colors[0],
          quantity: 30,
          notes: 'Rosas blancas para pastel principal',
        },
        {
          flower: flowers[4] || flowers[0],
          color: colors[0],
          quantity: 20,
          notes: 'Peonías rosas para decoración',
        },
        {
          flower: flowers[3] || flowers[0],
          quantity: 15,
          notes: 'Hortensias sin color específico',
        },
      ];
      for (const f of floresEvento) {
        await orderFlowerRepository.save(
          orderFlowerRepository.create({
            ...f,
            order: savedEventoCompleto,
            createdBy: adminUser,
            updatedBy: adminUser,
          }),
        );
      }
    }

    // Múltiples pasteleros
    if (bakers.length >= 2) {
      const asignaciones = [
        { baker: bakers[0], notes: 'Pastel principal' },
        { baker: bakers[1], notes: 'Cupcakes y postres' },
      ];
      for (const a of asignaciones) {
        await orderAssignmentRepository.save(
          orderAssignmentRepository.create({
            ...a,
            order: savedEventoCompleto,
            assignedDate: new Date(),
            createdBy: adminUser,
            updatedBy: adminUser,
          }),
        );
      }
    }

    console.log('   ✅ Pedido EVENTO COMPLETO: EVT-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 5: PERSONALIZADO - ★★☆ CON ESCRITURA PERO SIN PIPING ★★☆
    // ═══════════════════════════════════════════════════════════════════════
    const customer5 = customers[4] || customers[0];
    const personalizado = orderRepository.create({
      orderType: OrderType.PERSONALIZADO,
      orderCode: 'PER-2026-0001',
      deliveryDate: getFutureDate(6),
      deliveryTime: '14:00',
      readyTime: '11:00',
      totalAmount: 3500,
      advancePayment: 1750,
      remainingBalance: 1750,
      paymentMethod: PaymentMethod.CARD,
      ticketNumber: 'TKT-PER-001',
      hasPhotoReference: true,
      requiresInvoice: true,
      status: OrderStatus.CREATED,
      customer: customer5,
      branch: branches[1] || branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedPersonalizado = await orderRepository.save(personalizado);

    // Dirección para recoger
    const personalizadoAddress = orderDeliveryAddressRepository.create({
      street: 'Av. Vallarta',
      number: '2500',
      neighborhood: 'Arcos Vallarta',
      city: 'Guadalajara',
      postalCode: '44130',
      receiverName: 'Empresa XYZ - Recepción',
      receiverPhone: '3344556677',
      order: savedPersonalizado,
    });
    await orderDeliveryAddressRepository.save(personalizadoAddress);

    // Detalle con escritura pero sin piping
    const personalizadoDetail = orderDetailRepository.create({
      productSize: ProductSize.CUSTOM,
      customSize: '80 personas',
      price: 3500,
      quantity: 1,
      hasWriting: true,
      writingText: 'Felicitaciones Equipo 2026',
      writingLocation: WritingLocation.CENTER,
      // SIN pipingLocation
      notes: 'Diseño corporativo con logo impreso en oblea',
      referenceImageUrl: 'https://example.com/corp-logo.png',
      product: products[0],
      flavor: flavors[0], // Chocolate
      filling: fillings[4] || fillings[0], // Crema de mantequilla
      frosting: frostings[4] || frostings[0], // Ganache
      style: styles[0], // Liso
      color: colors[8] || colors[0], // Azul Royal
      // SIN breadType
      order: savedPersonalizado,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(personalizadoDetail);

    // Solo una flor
    if (flowers.length > 0) {
      await orderFlowerRepository.save(
        orderFlowerRepository.create({
          order: savedPersonalizado,
          flower: flowers[0],
          quantity: 3,
          // SIN color, SIN notes
          createdBy: adminUser,
          updatedBy: adminUser,
        }),
      );
    }

    console.log('   ✅ Pedido PERSONALIZADO: PER-2026-0001');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 6: VITRINA - ★★☆ CON SABOR/RELLENO PERO SIN ESTILO ★★☆
    // ═══════════════════════════════════════════════════════════════════════
    const vitrinaParcial = orderRepository.create({
      orderType: OrderType.VITRINA,
      orderCode: 'VIT-2026-0002',
      deliveryDate: getFutureDate(2),
      deliveryTime: '10:00',
      totalAmount: 580,
      advancePayment: 290,
      remainingBalance: 290,
      paymentMethod: PaymentMethod.CASH,
      ticketNumber: 'TKT-VIT-002',
      status: OrderStatus.CREATED,
      customer: customers[0],
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedVitrinaParcial = await orderRepository.save(vitrinaParcial);

    const vitrinaParcialDetail = orderDetailRepository.create({
      productSize: ProductSize.TWENTY_P,
      price: 580,
      quantity: 1,
      hasWriting: true,
      writingText: 'Feliz Día Mamá',
      writingLocation: WritingLocation.TOP,
      // SIN pipingLocation
      product: products[0],
      flavor: flavors[2], // Fresa
      filling: fillings[2], // Mermelada de fresa
      frosting: frostings[6] || frostings[0], // Chantilly
      // SIN style, color, breadType, notes, referenceImageUrl
      order: savedVitrinaParcial,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(vitrinaParcialDetail);

    // Sin flores, sin asignación
    console.log('   ✅ Pedido VITRINA PARCIAL: VIT-2026-0002');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 7: DOMICILIO - ★☆☆ SOLO CATÁLOGOS BÁSICOS ★☆☆
    // ═══════════════════════════════════════════════════════════════════════
    const domicilioBasico = orderRepository.create({
      orderType: OrderType.DOMICILIO,
      orderCode: 'DOM-2026-0003',
      deliveryRound: DeliveryRound.ROUND_3,
      deliveryDate: getFutureDate(5),
      deliveryTime: '12:00',
      totalAmount: 520,
      advancePayment: 260,
      remainingBalance: 260,
      status: OrderStatus.CREATED,
      customer: customers[1] || customers[0],
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
      // SIN: readyTime, paymentMethod, ticketNumber, hasPhotoReference
    });

    const savedDomicilioBasico = await orderRepository.save(domicilioBasico);

    // Dirección mínima
    const domicilioBasicoAddress = orderDeliveryAddressRepository.create({
      street: 'Calle 16 de Septiembre',
      number: '100',
      neighborhood: 'Centro',
      city: 'Guadalajara',
      receiverName: 'Juan Pérez',
      // SIN: postalCode, interphoneCode, betweenStreets, reference, deliveryNotes, receiverPhone
      order: savedDomicilioBasico,
    });
    await orderDeliveryAddressRepository.save(domicilioBasicoAddress);

    // Detalle con solo sabor
    const domicilioBasicoDetail = orderDetailRepository.create({
      productSize: ProductSize.FIFTEEN_P,
      price: 520,
      quantity: 1,
      hasWriting: false,
      product: products[0],
      flavor: flavors[3] || flavors[0], // Tres Leches
      // SIN: filling, frosting, style, color, breadType, notes
      order: savedDomicilioBasico,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(domicilioBasicoDetail);

    console.log('   ✅ Pedido DOMICILIO BÁSICO: DOM-2026-0003');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 8: EVENTO - ★★☆ SIN SERVICIOS DE MONTAJE ★★☆
    // ═══════════════════════════════════════════════════════════════════════
    const eventoSimple = orderRepository.create({
      orderType: OrderType.EVENTO,
      orderCode: 'EVT-2026-0002',
      deliveryDate: getFutureDate(8),
      deliveryTime: '17:00',
      eventTime: '19:00',
      // SIN: setupTime, branchDepartureTime, setupPersonName
      eventServices: [EventServiceType.CAKE], // Solo pastel
      guestCount: 50,
      totalAmount: 4500,
      advancePayment: 2250,
      remainingBalance: 2250,
      paymentMethod: PaymentMethod.TRANSFER,
      transferAccount: 'Santander 9999888877',
      ticketNumber: 'TKT-EVT-002',
      status: OrderStatus.CREATED,
      customer: customers[2] || customers[0],
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedEventoSimple = await orderRepository.save(eventoSimple);

    const eventoSimpleAddress = orderDeliveryAddressRepository.create({
      street: 'Blvd. Puerta de Hierro',
      number: '5000',
      neighborhood: 'Puerta de Hierro',
      city: 'Zapopan',
      reference: 'Club deportivo, área de eventos',
      receiverName: 'Organizador',
      order: savedEventoSimple,
    });
    await orderDeliveryAddressRepository.save(eventoSimpleAddress);

    const eventoSimpleDetail = orderDetailRepository.create({
      productSize: ProductSize.CUSTOM,
      customSize: '50 personas',
      price: 4500,
      quantity: 1,
      hasWriting: true,
      writingText: 'Feliz Retiro 2026',
      writingLocation: WritingLocation.PLAQUE,
      product: products[0],
      flavor: flavors[4] || flavors[0], // Red Velvet
      filling: fillings[6] || fillings[0], // Crema de queso
      frosting: frostings[5] || frostings[0], // Crema de Queso
      style: styles[2] || styles[0], // Semi Naked
      color: colors[10] || colors[0], // Rojo
      order: savedEventoSimple,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(eventoSimpleDetail);

    console.log('   ✅ Pedido EVENTO SIMPLE: EVT-2026-0002');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 9: DOMICILIO EN PROCESO - ★★★ LIQUIDADO ★★★
    // ═══════════════════════════════════════════════════════════════════════
    const domicilioLiquidado = orderRepository.create({
      orderType: OrderType.DOMICILIO,
      orderCode: 'DOM-2026-0004',
      deliveryRound: DeliveryRound.ROUND_1,
      deliveryDate: getFutureDate(1),
      deliveryTime: '11:00',
      readyTime: '09:00',
      totalAmount: 750,
      advancePayment: 375,
      remainingBalance: 0, // Ya liquidado
      paidAmount: 750, // Total pagado
      paymentMethod: PaymentMethod.CARD,
      ticketNumber: 'TKT-DOM-004',
      settlementTicketNumber: 'TKT-DOM-004-LIQ',
      settlementDate: new Date(),
      settlementTotal: 375,
      hasPhotoReference: false,
      status: OrderStatus.IN_PROCESS,
      customer: customers[3] || customers[0],
      branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedDomicilioLiquidado =
      await orderRepository.save(domicilioLiquidado);

    const domicilioLiquidadoAddress = orderDeliveryAddressRepository.create({
      street: 'Av. México',
      number: '2000',
      neighborhood: 'Ladron de Guevara',
      city: 'Guadalajara',
      postalCode: '44600',
      receiverName: 'Sofia Morales',
      receiverPhone: '3377889900',
      order: savedDomicilioLiquidado,
    });
    await orderDeliveryAddressRepository.save(domicilioLiquidadoAddress);

    const domicilioLiquidadoDetail = orderDetailRepository.create({
      productSize: ProductSize.TWENTY_P,
      price: 750,
      quantity: 1,
      hasWriting: true,
      writingText: '¡Felicidades!',
      writingLocation: WritingLocation.CENTER,
      pipingLocation: PipingLocation.BOTTOM_BORDER,
      product: products[0],
      flavor: flavors[5] || flavors[0], // Zanahoria
      filling: fillings[6] || fillings[0], // Crema de queso
      frosting: frostings[5] || frostings[0],
      order: savedDomicilioLiquidado,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(domicilioLiquidadoDetail);

    if (bakers.length > 2) {
      await orderAssignmentRepository.save(
        orderAssignmentRepository.create({
          order: savedDomicilioLiquidado,
          baker: bakers[2],
          assignedDate: new Date(),
          notes: 'Urgente - entrega mañana',
          createdBy: adminUser,
          updatedBy: adminUser,
        }),
      );
    }

    console.log('   ✅ Pedido DOMICILIO LIQUIDADO: DOM-2026-0004');
    createdCount++;

    // ═══════════════════════════════════════════════════════════════════════
    // PEDIDO 10: PERSONALIZADO - ★★★ CON TODO PERO SIN FLORES ★★★
    // ═══════════════════════════════════════════════════════════════════════
    const personalizadoSinFlores = orderRepository.create({
      orderType: OrderType.PERSONALIZADO,
      orderCode: 'PER-2026-0002',
      deliveryDate: getFutureDate(7),
      deliveryTime: '13:00',
      readyTime: '10:00',
      totalAmount: 1800,
      advancePayment: 900,
      remainingBalance: 900,
      paymentMethod: PaymentMethod.CASH,
      ticketNumber: 'TKT-PER-002',
      hasPhotoReference: true,
      status: OrderStatus.CREATED,
      customer: customers[4] || customers[0],
      branch: branches[1] || branch,
      createdBy: adminUser,
      updatedBy: adminUser,
    });

    const savedPersonalizadoSinFlores = await orderRepository.save(
      personalizadoSinFlores,
    );

    const personalizadoSinFloresAddress = orderDeliveryAddressRepository.create(
      {
        street: 'Calle Independencia',
        number: '500',
        neighborhood: 'Centro',
        city: 'Guadalajara',
        postalCode: '44100',
        betweenStreets: 'Entre 5 de Mayo y Morelos',
        reference: 'Local de fiestas',
        deliveryNotes: 'Preguntar por el encargado',
        receiverName: 'Miguel Ángel',
        receiverPhone: '3355443322',
        order: savedPersonalizadoSinFlores,
      },
    );
    await orderDeliveryAddressRepository.save(personalizadoSinFloresAddress);

    const personalizadoSinFloresDetail = orderDetailRepository.create({
      productSize: ProductSize.FORTY_P,
      price: 1800,
      quantity: 1,
      hasWriting: true,
      writingText: 'Primer Añito de Valentina',
      writingLocation: WritingLocation.TOP,
      pipingLocation: PipingLocation.FULL_BORDER,
      notes: 'Temática de unicornio, colores pastel',
      referenceImageUrl: 'https://example.com/unicorn-cake.jpg',
      product: products[0],
      flavor: flavors[1], // Vainilla
      filling: fillings[5] || fillings[0], // Chantilly
      frosting: frostings[2] || frostings[0], // Buttercream Americano
      style: styles[6] || styles[0], // Drip Cake
      color: colors[2] || colors[0], // Lavanda
      breadType: breadTypes[4] || breadTypes[0], // Red Velvet
      order: savedPersonalizadoSinFlores,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await orderDetailRepository.save(personalizadoSinFloresDetail);

    // SIN flores pero CON asignación
    if (bakers.length > 3) {
      await orderAssignmentRepository.save(
        orderAssignmentRepository.create({
          order: savedPersonalizadoSinFlores,
          baker: bakers[3],
          assignedDate: new Date(),
          notes: 'Diseño especial - unicornio',
          createdBy: adminUser,
          updatedBy: adminUser,
        }),
      );
    }

    console.log('   ✅ Pedido PERSONALIZADO SIN FLORES: PER-2026-0002');
    createdCount++;
  } catch (error) {
    console.error('   ❌ Error al crear pedidos:', error);
  }

  console.log(`   📊 Total pedidos creados: ${createdCount}\n`);
}
