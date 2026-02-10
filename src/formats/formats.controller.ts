import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { FormatsService } from './formats.service';

@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get('domicilio')
  async getDomicilioFormat(@Res() response: Response) {
    const pdfDoc = this.formatsService.domicilio();

    response.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfDoc.getStream();
    stream.pipe(response);
    stream.end();
  }
}
