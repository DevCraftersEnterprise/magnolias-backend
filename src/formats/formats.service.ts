import { Injectable } from '@nestjs/common';
import { PrinterService } from '../printer/printer.service';
import { getDomicilioReport } from './reports/domicilio.report';
import { OrdersService } from '../orders/orders.service';
import { TCreatedPdf } from 'pdfmake';

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

  evento() {}

  personalizado() {}

  vitrina() {}
}
