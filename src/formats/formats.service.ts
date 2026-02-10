import { Injectable } from '@nestjs/common';
import { TCreatedPdf } from 'pdfmake';
import { OrdersService } from '../orders/orders.service';
import { PrinterService } from '../printer/printer.service';
import { getDomicilioReport } from './reports/domicilio.report';
import { getEventoReport } from './reports/evento.report';
import { getPersonalizadoReport } from './reports/personalizado.report';
import { getVitrinaReport } from './reports/vitrina.report';

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

  async evento(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);

    const docDefinition = getEventoReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  async personalizado(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);

    const docDefinition = getPersonalizadoReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  async vitrina(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);

    const docDefinition = getVitrinaReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }
}
