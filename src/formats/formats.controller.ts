import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '../users/enums/user-role';
import { FormatsService } from './formats.service';

@ApiTags('Formats')
@Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
@ApiBearerAuth('access-token')
@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get('domicilio/:orderId')
  @ApiOperation({
    summary: 'Generar formato de domicilio',
    description:
      'Genera un PDF con el formato de entrega a domicilio para una orden específica',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID de la orden',
    type: 'string',
    format: 'uuid',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF generado exitosamente' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
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
  @ApiOperation({
    summary: 'Generar formato de evento',
    description:
      'Genera un PDF con el formato de evento para una orden específica',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID de la orden',
    type: 'string',
    format: 'uuid',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF generado exitosamente' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
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
  @ApiOperation({
    summary: 'Generar formato personalizado',
    description:
      'Genera un PDF con el formato personalizado para una orden específica',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID de la orden',
    type: 'string',
    format: 'uuid',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF generado exitosamente' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
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
  @ApiOperation({
    summary: 'Generar formato de vitrina',
    description:
      'Genera un PDF con el formato de vitrina para una orden específica',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID de la orden',
    type: 'string',
    format: 'uuid',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF generado exitosamente' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
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
