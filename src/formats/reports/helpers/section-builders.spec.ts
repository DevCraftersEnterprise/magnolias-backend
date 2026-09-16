import {
    getEventoCakeSection,
    getEventoDataSection,
    getEventoServicesSection,
} from './section-builders';
import { EventServiceType } from '../../../common/enums/event-service-type.enum';
import { PipingLocation } from '../../../common/enums/piping-location.enum';
import { WritingLocation } from '../../../common/enums/writing-location.enum';
import type { Order } from '../../../orders/entities/order.entity';
import type { OrderDetail } from '../../../orders/entities/order-detail.entity';
import { DateFormatter } from '../../utils/date-formatter';

function buildDetail(overrides: Partial<OrderDetail> = {}): OrderDetail {
    return {
        product: { category: { name: 'PASTELES' }, name: 'PERSONALIZADO' },
        referenceImages: [],
        hasWriting: false,
        ...overrides,
    } as unknown as OrderDetail;
}

// Recorre las filas de la tabla generada por getEventoCakeSection buscando el
// texto de la celda de VALOR (columna 3) cuya celda de ETIQUETA (columna 2)
// coincide, sin depender de índices fijos.
function valueForLabel(detail: OrderDetail, label: string): string {
    const [, table] = getEventoCakeSection(detail) as [unknown, any];
    const row = table.table.body.find((r: any[]) => r[2]?.text === label);
    return row?.[3]?.text ?? '';
}

describe('getEventoCakeSection', () => {
    it('traduce la ubicación del escrito al español (no el valor crudo del enum)', () => {
        const detail = buildDetail({ writingLocation: WritingLocation.TOP });

        expect(valueForLabel(detail, 'UBICACIÓN DEL ESCRITO')).toBe(
            'PARTE SUPERIOR',
        );
    });

    it('traduce la posición del pompeado al español (no el valor crudo del enum)', () => {
        const detail = buildDetail({
            pipingLocation: PipingLocation.TOP_BORDER,
        });

        expect(valueForLabel(detail, 'POSICIÓN POMPEADO')).toBe(
            'BORDE SUPERIOR',
        );
    });

    it('deja las celdas vacías cuando no hay escrito ni pompeado', () => {
        const detail = buildDetail();

        expect(valueForLabel(detail, 'UBICACIÓN DEL ESCRITO')).toBe('');
        expect(valueForLabel(detail, 'POSICIÓN POMPEADO')).toBe('');
    });
});

function buildOrder(overrides: Partial<Order> = {}): Order {
    return { eventServices: [], ...overrides } as unknown as Order;
}

// Busca, en cualquier fila de la tabla, la celda de VALOR inmediatamente a la
// derecha de la celda de ETIQUETA que coincide, sin depender de índices fijos.
function serviceMark(order: Order, label: string): string {
    const section = getEventoServicesSection(order) as any;
    for (const row of section.table.body) {
        const idx = row.findIndex((cell: any) => cell?.text === label);
        if (idx !== -1) return row[idx + 1]?.text ?? '';
    }
    return '';
}

describe('getEventoServicesSection', () => {
    it('marca con X solo los servicios incluidos en el pedido', () => {
        const order = buildOrder({
            eventServices: [EventServiceType.DESSERT_TABLE, EventServiceType.CAKE],
        });

        expect(serviceMark(order, 'MESA DE POSTRES')).toBe('X');
        expect(serviceMark(order, 'PASTEL')).toBe('X');
        expect(serviceMark(order, 'MESA DE QUESOS')).toBe('');
        expect(serviceMark(order, 'EMPLATADO')).toBe('');
    });

    it('incluye Charolas y Mesa de bocadillos como servicios marcables (cliente #4)', () => {
        const order = buildOrder({
            eventServices: [EventServiceType.TRAYS, EventServiceType.SNACK_TABLE],
        });

        expect(serviceMark(order, 'CHAROLAS')).toBe('X');
        expect(serviceMark(order, 'MESA DE BOCADILLOS')).toBe('X');
    });

    it('deja todo sin marcar cuando el pedido no tiene servicios', () => {
        const order = buildOrder();

        expect(serviceMark(order, 'MESA DE POSTRES')).toBe('');
        expect(serviceMark(order, 'CHAROLAS')).toBe('');
        expect(serviceMark(order, 'MESA DE BOCADILLOS')).toBe('');
    });
});

// Busca, en cualquier fila de la tabla, la celda de VALOR inmediatamente a la
// derecha de la celda de ETIQUETA que coincide, sin depender de índices fijos.
function dataValueForLabel(order: Order, label: string): string {
    const section = getEventoDataSection(order) as any;
    for (const row of section.table.body) {
        const idx = row.findIndex((cell: any) => cell?.text === label);
        if (idx !== -1) return row[idx + 1]?.text ?? '';
    }
    return '';
}

describe('getEventoDataSection', () => {
    it('usa setupDate para FECHA DE MONTAJE cuando el pedido la tiene (cliente: fecha de montaje distinta a la del evento)', () => {
        const setupDate = new Date('2026-01-10T12:00:00Z');
        const order = buildOrder({
            setupDate,
            deliveryDate: new Date('2026-01-15T12:00:00Z'),
        });

        expect(dataValueForLabel(order, 'FECHA DE MONTAJE')).toBe(
            DateFormatter.getDDMMMMYYYY(setupDate).toUpperCase(),
        );
    });

    it('usa deliveryDate como respaldo para FECHA DE MONTAJE cuando el pedido no tiene setupDate', () => {
        const deliveryDate = new Date('2026-03-20T12:00:00Z');
        const order = buildOrder({ deliveryDate });

        expect(dataValueForLabel(order, 'FECHA DE MONTAJE')).toBe(
            DateFormatter.getDDMMMMYYYY(deliveryDate).toUpperCase(),
        );
    });

    it('muestra HORA DE MONTAJE, PERSONA DE MONTAJE y HORA DEL EVENTO', () => {
        const order = buildOrder({
            deliveryDate: new Date('2026-03-20T12:00:00Z'),
            eventTime: '18:00',
            setupTime: '16:00',
            setupPersonName: 'Juan Pérez',
        });

        expect(dataValueForLabel(order, 'HORA DEL EVENTO')).toBe('18:00');
        expect(dataValueForLabel(order, 'HORA DE MONTAJE')).toBe('16:00');
        expect(dataValueForLabel(order, 'PERSONA DE MONTAJE')).toBe(
            'JUAN PÉREZ',
        );
    });
});
