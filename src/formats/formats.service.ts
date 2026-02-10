import { Injectable } from '@nestjs/common';
import { PrinterService } from '../printer/printer.service';
import { getDomicilioReport } from './reports/domicilio.report';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class FormatsService {
  constructor(
    private readonly printerService: PrinterService,
    private readonly ordersService: OrdersService,
  ) {}

  domicilio() {
    const docDefinition = getDomicilioReport();

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  evento() {}

  personalizado() {}

  vitrina() {}
}
