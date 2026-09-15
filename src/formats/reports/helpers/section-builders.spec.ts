import { getEventoCakeSection, getEventoServicesSection } from './section-builders';
import { EventServiceType } from '../../../common/enums/event-service-type.enum';
import { PipingLocation } from '../../../common/enums/piping-location.enum';
import { WritingLocation } from '../../../common/enums/writing-location.enum';
import type { Order } from '../../../orders/entities/order.entity';
import type { OrderDetail } from '../../../orders/entities/order-detail.entity';

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
