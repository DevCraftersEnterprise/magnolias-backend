import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { FormatsService } from './formats.service';

@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get('domicilio/:orderId')
  async getDomicilioFormat(
    @Res() response: Response,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    const pdfDoc = await this.formatsService.domicilio(orderId);

    response.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfDoc.getStream();
    stream.pipe(response);
    stream.end();
  }

  @Get('evento/:orderId')
  async getEventoFormat(
    @Res() response: Response,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    const pdfDoc = await this.formatsService.evento(orderId);

    response.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfDoc.getStream();
    stream.pipe(response);
    stream.end();
  }

  @Get('personalizado/:orderId')
  async getPersonalizadoFormat(
    @Res() response: Response,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    const pdfDoc = await this.formatsService.personalizado(orderId);

    response.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfDoc.getStream();
    stream.pipe(response);
    stream.end();
  }

  @Get('vitrina/:orderId')
  async getVitrinaFormat(
    @Res() response: Response,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    const pdfDoc = await this.formatsService.vitrina(orderId);

    response.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfDoc.getStream();
    stream.pipe(response);
    stream.end();
  }
}
