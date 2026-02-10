import { Injectable } from '@nestjs/common';
import { TCreatedPdf } from 'pdfmake';
import { OrdersService } from '../orders/orders.service';
import { PrinterService } from '../printer/printer.service';
import { getDomicilioReport } from './reports/domicilio.report';
import { getEventoReport } from './reports/evento.report';
import { getPersonalizadoReport } from './reports/personalizado.report';

@Injectable()
export class FormatsService {
  constructor(
    private readonly printerService: PrinterService,
    private readonly ordersService: OrdersService,
  ) {}

  async domicilio(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);

    const docDefinition = getDomicilioReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  evento(): TCreatedPdf {
    const docDefinition = getEventoReport();

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  personalizado(): TCreatedPdf {
    const docDefinition = getPersonalizadoReport();

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  vitrina() {}
}
