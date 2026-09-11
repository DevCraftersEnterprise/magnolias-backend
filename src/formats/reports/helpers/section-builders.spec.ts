import { getEventoCakeSection } from './section-builders';
import { PipingLocation } from '../../../common/enums/piping-location.enum';
import { WritingLocation } from '../../../common/enums/writing-location.enum';
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
