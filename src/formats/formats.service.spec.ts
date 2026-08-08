import { FormatsService } from './formats.service';
import * as imageToBase64Util from '../common/utils/image-to-base64';
import * as domicilioReport from './reports/domicilio.report';
import * as eventoReport from './reports/evento.report';
import * as vitrinaReport from './reports/vitrina.report';

jest.mock('../common/utils/image-to-base64');
jest.mock('./reports/domicilio.report');
jest.mock('./reports/evento.report');
jest.mock('./reports/vitrina.report');

function createMocks() {
    const printerService = { createPdf: jest.fn().mockReturnValue('pdf-doc') };
    const ordersService = { getOrderByTerm: jest.fn() };
    const service = new FormatsService(
        printerService as never,
        ordersService as never,
    );

    return { service, printerService, ordersService };
}

function baseOrder(overrides: Record<string, unknown> = {}) {
    return { id: 'order-1', details: [], ...overrides };
}

describe('FormatsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (domicilioReport.getDomicilioReport as jest.Mock).mockReturnValue({});
        (eventoReport.getEventoReport as jest.Mock).mockReturnValue({});
        (vitrinaReport.getVitrinaReport as jest.Mock).mockReturnValue({});
    });

    // El PDF es el único lugar donde se muestra transferAccount (ver
    // FindOneOrderUseCase); las 4 rutas de reporte deben pedirlo
    // explícitamente con includeTransferAccount = true.
    describe('incluye transferAccount al pedir el pedido (uso exclusivo del PDF)', () => {
        it('domicilio', async () => {
            const { service, ordersService } = createMocks();
            ordersService.getOrderByTerm.mockResolvedValue(baseOrder());

            await service.domicilio('order-1');

            expect(ordersService.getOrderByTerm).toHaveBeenCalledWith(
                'order-1',
                true,
            );
        });

        it('evento', async () => {
            const { service, ordersService } = createMocks();
            ordersService.getOrderByTerm.mockResolvedValue(baseOrder());

            await service.evento('order-1');

            expect(ordersService.getOrderByTerm).toHaveBeenCalledWith(
                'order-1',
                true,
            );
        });

        it('personalizado', async () => {
            const { service, ordersService } = createMocks();
            ordersService.getOrderByTerm.mockResolvedValue(baseOrder());

            await service.personalizado('order-1');

            expect(ordersService.getOrderByTerm).toHaveBeenCalledWith(
                'order-1',
                true,
            );
        });

        it('vitrina', async () => {
            const { service, ordersService } = createMocks();
            ordersService.getOrderByTerm.mockResolvedValue(baseOrder());

            await service.vitrina('order-1');

            expect(ordersService.getOrderByTerm).toHaveBeenCalledWith(
                'order-1',
                true,
            );
        });
    });

    it('genera el PDF con el printerService a partir del reporte construido', async () => {
        const { service, ordersService, printerService } = createMocks();
        ordersService.getOrderByTerm.mockResolvedValue(baseOrder());
        (domicilioReport.getDomicilioReport as jest.Mock).mockReturnValue({
            content: ['reporte'],
        });

        const result = await service.domicilio('order-1');

        expect(printerService.createPdf).toHaveBeenCalledWith(
            { content: ['reporte'] },
            {},
        );
        expect(result).toBe('pdf-doc');
    });

    it('convierte a base64 la primera imagen de referencia de cada detalle', async () => {
        const { service, ordersService } = createMocks();
        const details: any[] = [
            { referenceImages: [{ imageUrl: 'https://cdn/a.png' }] },
            { referenceImages: [] },
        ];
        const order = baseOrder({ details });
        ordersService.getOrderByTerm.mockResolvedValue(order);
        (imageToBase64Util.imageUrlToBase64 as jest.Mock).mockResolvedValue(
            'data:image/png;base64,xxx',
        );

        await service.domicilio('order-1');

        expect(imageToBase64Util.imageUrlToBase64).toHaveBeenCalledWith(
            'https://cdn/a.png',
        );
        expect(details[0].referenceImages[0].imageUrl).toBe(
            'data:image/png;base64,xxx',
        );
    });

    it('propaga el error si la conversión a base64 falla', async () => {
        const { service, ordersService } = createMocks();
        const order = baseOrder({
            details: [{ referenceImages: [{ imageUrl: 'https://cdn/a.png' }] }],
        });
        ordersService.getOrderByTerm.mockResolvedValue(order);
        (imageToBase64Util.imageUrlToBase64 as jest.Mock).mockRejectedValue(
            new Error('network down'),
        );

        await expect(service.domicilio('order-1')).rejects.toThrow(
            'Error al convertir la imagen a base64',
        );
    });
});
