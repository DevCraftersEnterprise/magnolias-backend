import { Injectable } from '@nestjs/common';
import { TCreatedPdf } from 'pdfmake';
import { imageUrlToBase64 } from '../common/utils/image-to-base64';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { PrinterService } from '../printer/printer.service';
import { getDomicilioReport } from './reports/domicilio.report';
import { getEventoReport } from './reports/evento.report';
import { getVitrinaReport } from './reports/vitrina.report';

@Injectable()
export class FormatsService {
  constructor(
    private readonly printerService: PrinterService,
    private readonly ordersService: OrdersService,
  ) { }

  async domicilio(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);
    await this.processOrderImages(order);

    const docDefinition = getDomicilioReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  async evento(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);
    await this.processOrderImages(order);

    const docDefinition = getEventoReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  async personalizado(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);
    await this.processOrderImages(order);

    const docDefinition = getDomicilioReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  async vitrina(orderId: string): Promise<TCreatedPdf> {
    const order = await this.ordersService.getOrderByTerm(orderId);
    await this.processOrderImages(order);

    const docDefinition = getVitrinaReport(order);

    const doc = this.printerService.createPdf(docDefinition, {});

    return doc;
  }

  private async processOrderImages(order: Order): Promise<void> {
    for (const detail of order.details) {
      if (detail.referenceImageUrl) {
        try {
          detail.referenceImageUrl = await imageUrlToBase64(detail.referenceImageUrl);
        } catch (e) {
          throw new Error(`Error al convertir la imagen a base64: ${e}`);
        }
      }
    }
  }
}
