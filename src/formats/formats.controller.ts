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

  @Get('evento')
  async getEventoFormat(@Res() response: Response) {
    const pdfDoc = this.formatsService.evento();

    response.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfDoc.getStream();
    stream.pipe(response);
    stream.end();
  }
}
