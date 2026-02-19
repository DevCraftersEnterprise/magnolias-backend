/**
 * Helpers para construir secciones de reportes PDF
 * Soporta múltiples páginas con un detalle por página
 */
import { Content, ContentText, TableCell } from 'pdfmake/interfaces';
import { Order } from '../../../orders/entities/order.entity';
import { OrderDetail } from '../../../orders/entities/order-detail.entity';
import { DateFormatter } from '../../utils/date-formatter';
import { CAKE_SINGLE_TIER_SVG, CAKE_THREE_TIER_SVG } from './svg-assets';
import { EventServiceType } from '../../../common/enums/event-service-type.enum';
import { EnumTransformer } from '../../utils/enum-transformer';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

/** Tipo para celdas de tabla con propiedades de texto */
type TextTableCell = ContentText & {
  fillColor?: string;
  border?: [boolean, boolean, boolean, boolean];
  colSpan?: number;
  rowSpan?: number;
};

export type ReportType = 'DOMICILIO' | 'EVENTO' | 'PERSONALIZADO' | 'VITRINA';

const COLORS = {
  HEADER_DARK: '#585858',
  HEADER_LIGHT: '#A1A1A1',
  CELL_GRAY: '#CFCFCF',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
};

const FONT_SIZE = {
  TITLE: 12,
  SUBTITLE: 11,
  HEADER: 10,
  BODY: 9,
};

// ═══════════════════════════════════════════════════════════════════════════
// CELDAS HELPER
// ═══════════════════════════════════════════════════════════════════════════

/** Celda de etiqueta con fondo gris */
export const labelCell = (
  text: string,
  options: Partial<TextTableCell> = {},
): TextTableCell => ({
  ...options,
  text,
  fontSize: options.fontSize ?? FONT_SIZE.BODY,
  bold: options.bold ?? true,
  fillColor: options.fillColor ?? COLORS.CELL_GRAY,
});

/** Celda de valor sin fondo */
export const valueCell = (
  text: string | number | undefined | null,
  options: Partial<TextTableCell> = {},
): TextTableCell => ({
  ...options,
  text: text?.toString() ?? '',
  fontSize: options.fontSize ?? FONT_SIZE.BODY,
  bold: options.bold ?? false,
});

/** Celda de título de sección */
export const sectionTitleCell = (
  text: string,
  options: Partial<TextTableCell> = {},
): TextTableCell => ({
  ...options,
  text,
  fontSize: options.fontSize ?? FONT_SIZE.HEADER,
  bold: options.bold ?? true,
  fillColor: options.fillColor ?? COLORS.HEADER_LIGHT,
  alignment: options.alignment ?? 'center',
  border: options.border ?? [true, true, true, false],
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES HELPER PARA FORMATEO
// ═══════════════════════════════════════════════════════════════════════════

/** Formatear texto a mayúsculas de forma segura */
export const toUpperSafe = (value: string | undefined | null): string =>
  value?.toUpperCase() ?? '';

/** Formatear precio */
export const formatCurrency = (value: number | undefined | null): string =>
  value != null ? `${value.toLocaleString('es-MX')}` : '';

/** Formatear booleano a SI/NO */
export const formatYesNo = (value: boolean | undefined | null): string =>
  value ? 'SI' : 'NO';

// ═══════════════════════════════════════════════════════════════════════════
// ENCABEZADOS POR TIPO DE REPORTE
// ═══════════════════════════════════════════════════════════════════════════

/** Encabezado para DOMICILIO */
export const getDomicilioHeader = (
  order: Order,
  pageNumber: number,
  totalPages: number,
): Content => ({
  table: {
    widths: ['15%', '15%', '45%', '25%'],
    body: [
      [
        {
          text: 'SERVICIO A DOMICILIO',
          fontSize: FONT_SIZE.HEADER,
          colSpan: 2,
          border: [true, true, false, false],
        },
        {},
        {
          text: `SUCURSAL ${toUpperSafe(order.branch?.name)}`,
          fontSize: FONT_SIZE.SUBTITLE,
          colSpan: 2,
          alignment: 'right',
          border: [false, true, true, false],
        },
        {},
      ],
      [
        {
          text: 'PASTELERÍA MAGNOLIAS',
          fontSize: FONT_SIZE.HEADER,
          colSpan: 3,
          border: [true, false, false, false],
        },
        {},
        {},
        {
          text: totalPages > 1 ? `Pág. ${pageNumber}/${totalPages}` : '',
          fontSize: 8,
          alignment: 'right',
          color: COLORS.HEADER_LIGHT,
          border: [false, false, true, false],
        },
      ],
      [
        {
          text: 'FECHA DE ENTREGA:',
          fontSize: FONT_SIZE.TITLE,
          bold: true,
          colSpan: 2,
          border: [true, false, false, false],
        },
        {},
        {
          text: toUpperSafe(DateFormatter.getDDMMMMYYYY(order.deliveryDate)),
          fontSize: FONT_SIZE.TITLE,
          bold: false,
          colSpan: 2,
          border: [false, false, true, false],
        },
        {},
      ],
    ],
  },
});

/** Encabezado para VITRINA */
export const getVitrinaHeader = (
  order: Order,
  pageNumber: number,
  totalPages: number,
): Content => ({
  table: {
    widths: ['*'],
    body: [
      [
        {
          text: [
            {
              text: `SUCURSAL ${toUpperSafe(order.branch?.name)} - PASTELERÍA MAGNOLIAS`,
            },
            totalPages > 1
              ? { text: `  (Pág. ${pageNumber}/${totalPages})`, fontSize: 8 }
              : { text: '' },
          ],
          fontSize: FONT_SIZE.HEADER,
          bold: true,
          fillColor: COLORS.HEADER_DARK,
          color: COLORS.WHITE,
          alignment: 'center',
          border: [true, true, true, false],
        },
      ],
    ],
  },
  margin: [0, 0, 0, 0],
});

/** Encabezado para PERSONALIZADO */
export const getPersonalizadoHeader = (
  order: Order,
  pageNumber: number,
  totalPages: number,
): Content => ({
  table: {
    widths: ['15%', '15%', '45%', '25%'],
    body: [
      [
        {
          text: 'SERVICIO PERSONALIZADO',
          fontSize: FONT_SIZE.HEADER,
          colSpan: 3,
          border: [true, true, false, false],
        },
        {},
        {},
        {
          text: `SUCURSAL ${toUpperSafe(order.branch?.name)}`,
          fontSize: FONT_SIZE.SUBTITLE,
          border: [false, true, true, false],
        },
      ],
      [
        {
          text: 'PASTELERÍA MAGNOLIAS',
          fontSize: FONT_SIZE.HEADER,
          colSpan: 3,
          border: [true, false, false, false],
        },
        {},
        {},
        {
          text: totalPages > 1 ? `Pág. ${pageNumber}/${totalPages}` : '',
          fontSize: 8,
          alignment: 'right',
          color: COLORS.HEADER_LIGHT,
          border: [false, false, true, false],
        },
      ],
      [
        {
          text: 'FECHA DE ENTREGA:',
          fontSize: FONT_SIZE.TITLE,
          bold: true,
          colSpan: 2,
          border: [true, false, false, false],
        },
        {},
        {
          text: toUpperSafe(DateFormatter.getDDMMMMYYYY(order.deliveryDate)),
          fontSize: FONT_SIZE.TITLE,
          bold: false,
          colSpan: 2,
          border: [false, false, true, false],
        },
        {},
      ],
    ],
  },
});

/** Encabezado para EVENTO */
export const getEventoHeader = (
  order: Order,
  pageNumber: number,
  totalPages: number,
): Content => ({
  table: {
    widths: ['15%', '15%', '45%', '25%'],
    body: [
      [
        {
          text: `SUCURSAL ${toUpperSafe(order.branch?.name)}`,
          fontSize: 11,
          colSpan: 3,
          border: [true, true, true, false],
        },
        {},
        {},
        {
          text: 'EVENTO',
          rowSpan: 2,
          fontSize: 22,
          bold: true,
          color: COLORS.WHITE,
          fillColor: COLORS.HEADER_LIGHT,
          alignment: 'center',
        },
      ],
      [
        {
          text: [
            { text: 'PASTELERÍA MAGNOLIAS' },
            totalPages > 1
              ? { text: `  (Pág. ${pageNumber}/${totalPages})`, fontSize: 8 }
              : { text: '' },
          ],
          fontSize: FONT_SIZE.HEADER,
          colSpan: 3,
          border: [true, false, true, false],
        },
        {},
        {},
        {},
      ],
      [
        {
          text: '',
          fontSize: FONT_SIZE.TITLE,
          colSpan: 3,
          border: [true, false, false, false],
        },
        {},
        {},
        {
          text: 'FECHA Y HR DE RECOLECCIÓN',
          fontSize: FONT_SIZE.BODY,
          bold: true,
          color: COLORS.WHITE,
          fillColor: COLORS.BLACK,
        },
      ],
      [
        {
          text: 'FECHA DE ENTREGA:',
          fontSize: FONT_SIZE.TITLE,
          colSpan: 2,
          bold: true,
          border: [true, false, false, false],
        },
        {},
        {
          text: toUpperSafe(DateFormatter.getDDMMMMYYYY(order.deliveryDate)),
          fontSize: FONT_SIZE.TITLE,
          bold: false,
          border: [false, false, false, false],
        },
        {
          text: order.deliveryTime ?? '',
          fontSize: FONT_SIZE.BODY,
          border: [true, true, true, false],
        },
      ],
    ],
  },
});

/** Obtener encabezado según tipo de reporte */
export const getHeader = (
  order: Order,
  reportType: ReportType,
  pageNumber: number,
  totalPages: number,
): Content => {
  switch (reportType) {
    case 'DOMICILIO':
      return getDomicilioHeader(order, pageNumber, totalPages);
    case 'VITRINA':
      return getVitrinaHeader(order, pageNumber, totalPages);
    case 'PERSONALIZADO':
      return getPersonalizadoHeader(order, pageNumber, totalPages);
    case 'EVENTO':
      return getEventoHeader(order, pageNumber, totalPages);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE DATOS DEL CLIENTE
// ═══════════════════════════════════════════════════════════════════════════

/** Datos del cliente para DOMICILIO */
export const getDomicilioCustomerSection = (
  order: Order,
  detail: OrderDetail,
): Content => ({
  table: {
    widths: ['20%', '15%', '15%', '20%', '30%'],
    body: [
      [
        labelCell('FECHA DE SOLICITUD'),
        valueCell(toUpperSafe(DateFormatter.getDDMMMMYYYY(order.createdAt)), {
          colSpan: 2,
        }),
        {},
        labelCell('HORA DE ENTREGA'),
        valueCell(order.deliveryTime),
      ],
      [
        labelCell('CLIENTE'),
        valueCell(toUpperSafe(order.customer?.fullName), {
          colSpan: 2,
        }),
        {},
        labelCell('LISTO A LA HORA'),
        valueCell(order.readyTime),
      ],
      [
        labelCell('RECIBE'),
        valueCell(toUpperSafe(order.deliveryAddress?.receiverName), {
          colSpan: 2,
        }),
        {},
        labelCell('TELÉFONO'),
        valueCell(order.customer?.phone),
      ],
      [
        labelCell('', { border: [true, true, true, false] }),
        valueCell('', { border: [true, true, false, false] }),
        detail.referenceImageUrl
          ? {
              qr: detail.referenceImageUrl,
              rowSpan: 2,
              fit: 60,
              alignment: 'center',
              border: [false, false, false, false],
            }
          : { text: '', rowSpan: 2 },
        labelCell('', { border: [true, true, true, false] }),
        valueCell('', { border: [true, true, true, false] }),
      ],
      [
        labelCell('FOTO', { border: [true, false, true, false] }),
        valueCell(formatYesNo(order.hasPhotoReference), {
          border: [true, false, false, false],
        }),
        {
          text: '',
          border: [false, false, false, false],
        },
        labelCell('ATENDIÓ', {
          rowSpan: 1,
          border: [true, false, true, false],
        }),
        valueCell(
          `${toUpperSafe(order.createdBy?.name)} ${toUpperSafe(order.createdBy?.lastname)}`,
          { rowSpan: 1, border: [true, false, true, false] },
        ),
      ],
    ],
  },
});

/** Datos del cliente para VITRINA y PERSONALIZADO (sin dirección) */
export const getSimpleCustomerSection = (
  order: Order,
  detail: OrderDetail,
  showReadyTime: boolean = false,
): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('FECHA DE SOLICITUD'),
        valueCell(toUpperSafe(DateFormatter.getDDMMMMYYYY(order.createdAt))),
        labelCell('HORA DE ENTREGA'),
        valueCell(order.deliveryTime),
      ],
      [
        labelCell('CLIENTE'),
        valueCell(toUpperSafe(order.customer?.fullName)),
        labelCell(showReadyTime ? 'LISTO A LA HORA' : 'TELÉFONO'),
        valueCell(showReadyTime ? order.readyTime : order.customer?.phone),
      ],
      [
        labelCell('', { border: [true, true, true, false] }),
        detail.referenceImageUrl
          ? {
              qr: detail.referenceImageUrl,
              rowSpan: 2,
              fit: 60,
              alignment: 'right',
              border: [false, false, false, false],
            }
          : { text: '', border: [false, false, false, false], rowSpan: 2 },
        labelCell(showReadyTime ? 'TELÉFONO' : '', {
          border: [true, true, true, false],
        }),
        valueCell(showReadyTime ? order.customer?.phone : '', {
          border: [true, true, true, false],
        }),
      ],
      [
        labelCell('FOTO', { border: [true, false, true, false] }),
        valueCell('', { border: [true, false, true, false] }),
        labelCell('ATENDIÓ', {
          rowSpan: 2,
          border: [true, false, true, false],
        }),
        valueCell(
          `${toUpperSafe(order.createdBy?.name)} ${toUpperSafe(order.createdBy?.lastname)}`,
          { rowSpan: 2, border: [true, false, true, false] },
        ),
      ],
      [
        labelCell('', { border: [true, false, true, false] }),
        valueCell(order.hasPhotoReference ? `SI` : 'NO', {
          bold: true,
          alignment: 'left',
          border: [true, false, true, false],
        }),
        {},
        {},
      ],
    ],
  },
});

/** Datos del cliente para EVENTO */
export const getEventoCustomerSection = (order: Order): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('FECHA DE SOLICITUD'),
        valueCell(toUpperSafe(DateFormatter.getDDMMMMYYYY(order.createdAt))),
        labelCell('HORA DE SALIDA SUC'),
        valueCell(order.branchDepartureTime),
      ],
      [
        labelCell('CLIENTE'),
        valueCell(toUpperSafe(order.customer?.fullName)),
        labelCell('TELÉFONO'),
        valueCell(order.customer?.phone),
      ],
      [
        labelCell('RECIBE', { border: [true, true, true, false] }),
        valueCell(toUpperSafe(order.deliveryAddress?.receiverName), {
          border: [true, true, true, false],
        }),
        labelCell('TELÉFONO', { border: [true, true, true, false] }),
        valueCell(order.deliveryAddress?.receiverPhone, {
          border: [true, true, true, false],
        }),
      ],
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE DIRECCIÓN
// ═══════════════════════════════════════════════════════════════════════════

/** Título de sección Dirección */
export const getAddressSectionTitle = (): Content => ({
  table: {
    widths: '*',
    body: [[sectionTitleCell('DIRECCIÓN')]],
  },
  margin: [0, 0, 0, 0],
});

/** Tabla de dirección */
export const getAddressTable = (order: Order): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('CALLE'),
        valueCell(toUpperSafe(order.deliveryAddress?.street)),
        labelCell('NÚMERO'),
        valueCell(order.deliveryAddress?.number),
      ],
      [
        labelCell('COLONIA'),
        valueCell(toUpperSafe(order.deliveryAddress?.neighborhood)),
        labelCell('CLAVE INTERPHONE'),
        valueCell(order.deliveryAddress?.interphoneCode ?? 'NO APLICA'),
      ],
      [
        labelCell('ENTRE'),
        valueCell(toUpperSafe(order.deliveryAddress?.betweenStreets)),
        labelCell('REFERENCIA'),
        valueCell(toUpperSafe(order.deliveryAddress?.reference)),
      ],
      [
        labelCell('NOTA', { border: [true, true, true, false] }),
        {
          text: toUpperSafe(order.deliveryAddress?.deliveryNotes),
          fontSize: FONT_SIZE.BODY,
          colSpan: 3,
          border: [true, true, true, false],
        },
        {},
        {},
      ],
    ],
  },
});

/** Sección completa de dirección */
export const getAddressSection = (order: Order): Content[] => [
  getAddressSectionTitle(),
  getAddressTable(order),
];

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE DETALLE DEL PEDIDO
// ═══════════════════════════════════════════════════════════════════════════

/** Título de sección Descripción del Pedido */
export const getDetailSectionTitle = (customTitle?: string): Content => ({
  table: {
    widths: '*',
    body: [[sectionTitleCell(customTitle ?? 'DESCRIPCIÓN DEL PEDIDO')]],
  },
  margin: [0, 0, 0, 0],
});

/** Tabla de descripción del pedido/detalle */
export const getDetailTable = (detail: OrderDetail | null): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('TAMAÑO'),
        valueCell(
          detail?.customSize
            ? `${detail.productSize} - ${detail.customSize}`
            : detail?.productSize,
        ),
        labelCell('CUBIERTA SABOR'),
        valueCell(toUpperSafe(detail?.frosting?.name)),
      ],
      [
        labelCell('SABOR DE PAN'),
        valueCell(toUpperSafe(detail?.flavor?.name ?? detail?.breadType?.name)),
        labelCell('TIPO DE CUBIERTA'),
        valueCell(toUpperSafe(detail?.style?.name)),
      ],
      [
        labelCell('RELLENO'),
        valueCell(toUpperSafe(detail?.filling?.name)),
        labelCell('"ESCRITO"'),
        valueCell(
          detail?.hasWriting
            ? detail.writingText?.toUpperCase()
            : 'SIN ESCRITO',
        ),
      ],
      [
        labelCell('ESTILO Y COLOR DEL ESCRITO'),
        valueCell(toUpperSafe(detail?.color?.name)),
        labelCell('UBICACIÓN DEL ESCRITO'),
        valueCell(
          detail?.writingLocation
            ? EnumTransformer.translateWritingLocation(
                detail.writingLocation,
              ).toUpperCase()
            : '',
        ),
      ],
      [
        labelCell('ESTILO Y COLOR DE POMPEADO', {
          border: [true, true, true, false],
        }),
        valueCell(toUpperSafe(detail?.color?.name), {
          border: [true, true, true, false],
        }),
        labelCell('POSICIÓN POMPEADO', { border: [true, true, true, false] }),
        valueCell(
          detail?.pipingLocation
            ? EnumTransformer.translatePipingLocation(
                detail.pipingLocation,
              ).toUpperCase()
            : '',
          {
            border: [true, true, true, false],
          },
        ),
      ],
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE DECORACIÓN Y NOTAS
// ═══════════════════════════════════════════════════════════════════════════

/** Sección de decoración con SVG del pastel */
export const getDecorationSection = (
  detail: OrderDetail,
  useSingleTierCake: boolean = false,
  heights: [number, number] = [100, 50],
): Content => ({
  table: {
    widths: ['30%', '20%', '30%', '20%'],
    heights,
    body: [
      [
        {
          svg: useSingleTierCake ? CAKE_SINGLE_TIER_SVG : CAKE_THREE_TIER_SVG,
          width: 140,
          alignment: 'center',
          rowSpan: 2,
        },
        {
          text: 'DECORACIÓN',
          fontSize: FONT_SIZE.HEADER,
          bold: true,
          border: [true, true, false, true],
        },
        {
          text: detail.decorationNotes?.toUpperCase() ?? '',
          fontSize: FONT_SIZE.HEADER,
          colSpan: 2,
          border: [false, true, true, true],
        },
        {},
      ],
      [
        {},
        {
          text: 'NOTAS ADICIONALES',
          fontSize: FONT_SIZE.HEADER,
          bold: true,
          border: [true, true, false, true],
        },
        {
          text: detail.notes?.toUpperCase() ?? '',
          fontSize: FONT_SIZE.HEADER,
          colSpan: 2,
          border: [false, true, true, true],
        },
        {},
      ],
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE FLORES
// ═══════════════════════════════════════════════════════════════════════════

/** Sección de flores del pedido */
export const getFlowersSection = (order: Order): Content | null => {
  if (!order.orderFlowers || order.orderFlowers.length === 0) return null;

  const flowersText = order.orderFlowers
    .map(
      (f) =>
        `${f.flower?.name ?? 'Flor'} (${f.quantity}) ${f.color ? `- ${f.color.name}` : ''} ${f.notes ? `- ${f.notes}` : ''}`,
    )
    .join('; ');

  return {
    table: {
      widths: ['20%', '80%'],
      body: [
        [
          labelCell('FLORES', { border: [true, false, true, true] }),
          valueCell(flowersText, { border: [true, false, true, true] }),
        ],
      ],
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE CONDICIONES DE SERVICIO
// ═══════════════════════════════════════════════════════════════════════════

/** Condiciones de servicio estándar */
export const getConditionsSection = (reportType: ReportType): Content => {
  const conditions: Record<ReportType, string> = {
    DOMICILIO:
      'Los tonos, técnicas, tipos de flores, dulces, chocolates, frutas y diseños de dibujos son aproximados y pueden variar respecto a la imagen de referencia. Al aceptar estos términos, se deberá firmar la casilla correspondiente como consentimiento para proceder con el servicio.',
    VITRINA:
      'Acepto los cambios solicitados en producto de vitrina como pan, relleno, tamaño, decoración, etc. Entiendo que el producto final puede variar en sabor, tamaño, o alteraciones adicionales al producto original en tienda.',
    PERSONALIZADO:
      'Los tonos, técnicas, tipos de flores, dulces, chocolates, frutas y diseños de dibujos son aproximados y pueden variar respecto a la imagen de referencia. Al aceptar estos términos, se deberá firmar la casilla correspondiente como consentimiento para proceder con el servicio.',
    EVENTO:
      'Los tonos, técnicas, tipos de flores, dulces, chocolates, frutas y diseños de dibujos son aproximados y pueden variar respecto a la imagen de referencia. Al aceptar estos términos, se deberá firmar la casilla correspondiente como consentimiento para proceder con el servicio.',
  };

  const prefix =
    reportType === 'VITRINA'
      ? 'EN CASO DE CAMBIOS -> CONDICIONES DE SERVICIO: '
      : 'CONDICIONES DE SERVICIO: ';

  return {
    table: {
      widths: '*',
      body: [
        [
          {
            text: [
              {
                text: prefix,
                fontSize: FONT_SIZE.BODY,
                bold: true,
                color: 'red',
              },
              {
                text: conditions[reportType],
                fontSize: FONT_SIZE.BODY,
                bold: false,
                color: 'black',
              },
            ],
            fillColor: COLORS.CELL_GRAY,
            border: [true, false, true, false],
          },
        ],
      ],
    },
    margin: [0, 0, 0, 0],
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE FIRMAS
// ═══════════════════════════════════════════════════════════════════════════

/** Sección de firma del cliente */
export const getSignatureSection = (
  includeDeliverySignature: boolean = true,
): Content => {
  const rows: TableCell[][] = [
    [
      {
        text: 'FIRMA Y CONFIRMACIÓN DEL CLIENTE',
        colSpan: 3,
        fillColor: COLORS.CELL_GRAY,
        fontSize: FONT_SIZE.BODY,
        bold: true,
        border: [true, true, true, false],
      },
      {},
      {},
      { text: '', border: [true, true, true, false] },
    ],
  ];

  if (includeDeliverySignature) {
    rows.push([
      {
        text: 'FIRMA DE RECIBIDO',
        colSpan: 3,
        fillColor: COLORS.CELL_GRAY,
        fontSize: FONT_SIZE.BODY,
        bold: true,
        border: [true, true, true, false],
      },
      {},
      {},
      { text: '', border: [true, true, true, false] },
    ]);
  }

  return {
    table: {
      widths: ['20%', '30%', '20%', '30%'],
      body: rows,
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN DE TOTALES
// ═══════════════════════════════════════════════════════════════════════════

/** Totales para DOMICILIO y PERSONALIZADO */
export const getDomicilioTotalsSection = (order: Order): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('TOTAL'),
        valueCell(formatCurrency(order.totalAmount)),
        labelCell('DEBE'),
        valueCell(formatCurrency(order.remainingBalance)),
      ],
      [
        labelCell('ANTICIPO'),
        valueCell(formatCurrency(order.advancePayment)),
        labelCell('PAGARÁ CON'),
        valueCell(
          order.paymentMethod
            ? EnumTransformer.translatePaymentMethod(
                order.paymentMethod,
              ).toUpperCase()
            : '',
        ),
      ],
      [
        labelCell('# TICKET'),
        valueCell(order.ticketNumber),
        labelCell('# TICKET LIQUIDACIÓN'),
        valueCell(order.settlementTicketNumber),
      ],
      [
        labelCell('TRANSFERENCIA CUENTA'),
        valueCell(order.transferAccount),
        labelCell('FACTURA'),
        valueCell(formatYesNo(order.requiresInvoice)),
      ],
    ],
  },
});

/** Totales para VITRINA */
export const getVitrinaTotalsSection = (order: Order): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('COSTO'),
        valueCell(formatCurrency(order.totalAmount)),
        labelCell('DEBE'),
        valueCell(formatCurrency(order.remainingBalance)),
      ],
      [
        labelCell('ANTICIPO'),
        valueCell(formatCurrency(order.advancePayment)),
        labelCell('PAGADO'),
        valueCell(formatCurrency(order.paidAmount)),
      ],
      [
        labelCell('# TICKET | TRANSFERENCIA'),
        valueCell(order.ticketNumber ?? order.transferAccount),
        labelCell('# TICKET | TRANSFERENCIA'),
        valueCell(formatYesNo(order.requiresInvoice)),
      ],
    ],
  },
});

/** Totales para EVENTO */
export const getEventoTotalsSection = (order: Order): Content[] => [
  {
    table: {
      widths: ['20%', '30%', '20%', '30%'],
      body: [
        [
          labelCell('TOTAL POSTRES'),
          valueCell(formatCurrency(order.dessertsTotal)),
          labelCell('ANTICIPO'),
          valueCell(formatCurrency(order.advancePayment)),
        ],
        [
          labelCell('SERVICIO MONTAJE'),
          valueCell(formatCurrency(order.setupServiceCost)),
          labelCell('TICKET | TRANSFERENCIA'),
          valueCell(order.ticketNumber ?? order.transferAccount),
        ],
        [
          labelCell('TOTAL'),
          valueCell(formatCurrency(order.totalAmount)),
          labelCell('FECHA'),
          valueCell(
            order.settlementDate
              ? DateFormatter.getDDMMMMYYYY(order.settlementDate)
              : '',
          ),
        ],
        [
          labelCell('FACTURA', { border: [true, true, true, false] }),
          valueCell(formatYesNo(order.requiresInvoice), {
            border: [true, true, true, false],
          }),
          labelCell('DEBE', { border: [true, true, true, false] }),
          valueCell(formatCurrency(order.remainingBalance), {
            border: [true, true, true, false],
          }),
        ],
      ],
    },
  },
  // Datos de liquidación
  {
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [
          {
            text: 'FECHA DE LIQUIDACIÓN',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [true, true, false, true],
          },
          {
            text: order.settlementDate
              ? DateFormatter.getDDMMMMYYYY(order.settlementDate)
              : '',
            fontSize: FONT_SIZE.BODY,
            colSpan: 3,
            fillColor: COLORS.HEADER_LIGHT,
            border: [false, true, true, true],
          },
          {},
          {},
        ],
        [
          {
            text: 'TOTAL A LIQUIDAR',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [true, true, false, true],
          },
          {
            text: formatCurrency(
              order.settlementTotal ?? order.remainingBalance,
            ),
            fontSize: FONT_SIZE.BODY,
            fillColor: COLORS.HEADER_LIGHT,
            border: [false, true, true, true],
          },
          {
            text: 'TICKET | TRANSFERENCIA',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [false, true, false, true],
          },
          {
            text: order.settlementTicketNumber ?? '',
            fontSize: FONT_SIZE.BODY,
            fillColor: COLORS.HEADER_LIGHT,
            border: [false, true, true, true],
          },
        ],
      ],
    },
  },
];

/** Totales para PERSONALIZADO */
export const getPersonalizadoTotalsSection = (order: Order): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('TOTAL'),
        valueCell(formatCurrency(order.totalAmount)),
        labelCell('DEBE', { rowSpan: 2 }),
        valueCell(formatCurrency(order.remainingBalance), { rowSpan: 2 }),
      ],
      [
        labelCell('ANTICIPO'),
        valueCell(formatCurrency(order.advancePayment)),
        {},
        {},
      ],
      [
        labelCell('# TICKET ANTICIPO'),
        valueCell(order.ticketNumber),
        labelCell('# TICKET LIQUIDACIÓN'),
        valueCell(order.settlementTicketNumber),
      ],
      [
        labelCell('TRANSFERENCIA CUENTA'),
        valueCell(order.transferAccount),
        labelCell('FACTURA'),
        valueCell(formatYesNo(order.requiresInvoice)),
      ],
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SECCIONES ESPECÍFICAS DE EVENTO
// ═══════════════════════════════════════════════════════════════════════════

/** Tipos de servicio del evento */
export const getEventoServicesSection = (order: Order): Content => {
  const hasService = (type: EventServiceType) =>
    order.eventServices?.includes(type) ? 'X' : '';

  return {
    table: {
      widths: ['20%', '5%', '20%', '5%', '20%', '5%', '20%', '5%'],
      body: [
        [
          {
            text: 'MESA DE POSTRES',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [true, true, true, false],
          },
          {
            text: hasService(EventServiceType.DESSERT_TABLE),
            fontSize: FONT_SIZE.BODY,
            alignment: 'center',
            border: [true, true, true, false],
          },
          {
            text: 'MESA DE QUESOS',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [true, true, true, false],
          },
          {
            text: hasService(EventServiceType.CHEESE_TABLE),
            fontSize: FONT_SIZE.BODY,
            alignment: 'center',
            border: [true, true, true, false],
          },
          {
            text: 'EMPLATADO',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [true, true, true, false],
          },
          {
            text: hasService(EventServiceType.PLATED),
            fontSize: FONT_SIZE.BODY,
            alignment: 'center',
            border: [true, true, true, false],
          },
          {
            text: 'PASTEL',
            fillColor: COLORS.HEADER_LIGHT,
            fontSize: FONT_SIZE.BODY,
            bold: true,
            border: [true, true, true, false],
          },
          {
            text: hasService(EventServiceType.CAKE),
            fontSize: FONT_SIZE.BODY,
            alignment: 'center',
            border: [true, true, true, false],
          },
        ],
      ],
    },
  };
};

/** Datos del evento (hora, montaje, etc.) */
export const getEventoDataSection = (order: Order): Content => ({
  table: {
    widths: ['20%', '30%', '20%', '30%'],
    body: [
      [
        labelCell('HORA DEL EVENTO'),
        valueCell(order.eventTime),
        labelCell('PERSONA DE MONTAJE'),
        valueCell(toUpperSafe(order.setupPersonName)),
      ],
      [
        labelCell('HORA DE MONTAJE', { border: [true, true, true, false] }),
        valueCell(order.setupTime, { border: [true, true, true, false] }),
        labelCell('ATENDIÓ', { border: [true, true, true, false] }),
        valueCell(
          `${toUpperSafe(order.createdBy?.name)} ${toUpperSafe(order.createdBy?.lastname)}`,
          { border: [true, true, true, false] },
        ),
      ],
    ],
  },
});

/** Descripción general del evento */
export const getEventoDescriptionSection = (order: Order): Content[] => [
  getDetailSectionTitle('DESCRIPCIÓN DEL PEDIDO'),
  {
    table: {
      widths: ['20%', '30%', '20%', '30%'],
      body: [
        [
          labelCell('TIPO DE MESA'),
          valueCell(''), // Se llena manualmente
          labelCell('CANTIDAD DE PERSONAS'),
          valueCell(order.guestCount?.toString()),
        ],
        [
          labelCell('DETALLES DEL PEDIDO', {
            border: [true, true, true, false],
          }),
          {
            text: '',
            fontSize: FONT_SIZE.BODY,
            colSpan: 3,
            border: [true, true, true, false],
          },
          {},
          {},
        ],
      ],
    },
  },
];

/** Sección de pastel para evento */
export const getEventoCakeSection = (detail: OrderDetail): Content[] => [
  getDetailSectionTitle('PASTEL'),
  {
    table: {
      widths: ['20%', '30%', '20%', '30%'],
      body: [
        [
          labelCell('', { border: [true, true, true, false] }),
          detail.referenceImageUrl
            ? {
                qr: detail.referenceImageUrl,
                rowSpan: 2,
                fit: 60,
                alignment: 'right',
                border: [false, false, false, false],
              }
            : { text: '', border: [false, false, false, false], rowSpan: 2 },
          labelCell('', { border: [true, true, true, false] }),
          valueCell('', { border: [true, true, true, false] }),
        ],
        [
          labelCell('FOTO', { border: [true, false, true, false] }),
          valueCell('', { bold: true, border: [true, false, true, false] }),
          labelCell('"ESCRITO"', { border: [true, false, true, false] }),
          valueCell(detail.hasWriting ? detail.writingText : 'SIN ESCRITO', {
            border: [true, false, true, false],
          }),
        ],
        [
          labelCell('', { border: [true, false, true, false] }),
          valueCell(detail.referenceImageUrl ? 'SI' : 'NO', {
            border: [true, false, true, false],
          }),
          labelCell('', { border: [true, false, true, false] }),
          valueCell('', { border: [true, false, true, false] }),
        ],
        [
          labelCell('TAMAÑO'),
          valueCell(''),
          labelCell('ESTILO Y COLOR DEL ESCRITO'),
          valueCell(toUpperSafe(detail.color?.name)),
        ],
        [
          labelCell('SABOR DE PAN'),
          valueCell(toUpperSafe(detail.flavor?.name ?? detail.breadType?.name)),
          labelCell('UBICACIÓN DEL ESCRITO'),
          valueCell(detail.writingLocation ?? ''),
        ],
        [
          labelCell('RELLENO'),
          valueCell(toUpperSafe(detail.filling?.name)),
          labelCell('ESTILO Y COLOR DE POMPEADO'),
          valueCell(''),
        ],
        [
          labelCell('CUBIERTA SABOR'),
          valueCell(toUpperSafe(detail.frosting?.name)),
          labelCell('POSICIÓN POMPEADO'),
          valueCell(detail.pipingLocation ?? ''),
        ],
        [
          labelCell('TIPO DE CUBIERTA', { border: [true, true, true, false] }),
          valueCell(toUpperSafe(detail.style?.name), {
            border: [true, true, true, false],
          }),
          labelCell('DESCRIPCIÓN', { border: [true, true, true, false] }),
          valueCell(detail.notes ?? '', { border: [true, true, true, false] }),
        ],
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GENERADOR DE PÁGINAS
// ═══════════════════════════════════════════════════════════════════════════

/** Genera salto de página */
export const pageBreak = (): Content => ({
  text: '',
  pageBreak: 'before' as const,
});

/** Verifica si hay múltiples detalles */
export const hasMultipleDetails = (order: Order): boolean =>
  (order.details?.length ?? 0) > 1;

/** Obtiene el primer detalle o uno vacío */
export const getFirstDetail = (order: Order): OrderDetail =>
  order.details?.[0] ?? ({} as OrderDetail);
