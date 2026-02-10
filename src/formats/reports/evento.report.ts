import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Order } from '../../orders/entities/order.entity';

export const getEventoReport = (order: Order): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [20, 20, 20, 20],
    content: [
      // Encabezado
      {
        table: {
          widths: ['15%', '15%', '45%', '25%'],
          body: [
            [
              {
                text: `SUCURSAL NAVARRETE`,
                fontSize: 11,
                colSpan: 3,
                border: [true, true, true, false],
              },
              {},
              {},
              {
                text: 'EVENTO',
                rowSpan: 2,
                fontSize: 22,
                bold: true,
                color: 'white',
                fillColor: '#A1A1A1',
                alignment: 'center',
              },
            ],
            [
              {
                text: 'PASTELERÍA MAGNOLIAS',
                fontSize: 10,
                colSpan: 3,
                border: [true, false, true, false],
              },
              {},
              {},
              {},
            ],
            [
              {
                text: '',
                fontSize: 16,
                colSpan: 3,
                border: [true, false, false, false],
              },
              {},
              {},
              {
                text: 'FECHA Y HR DE RECOLECCIÓN',
                fontSize: 9,
                bold: true,
                color: 'white',
                fillColor: '#000000',
              },
            ],
            [
              {
                text: 'FECHA DE ENTREGA:',
                fontSize: 16,
                colSpan: 2,
                bold: true,
                border: [true, false, false, false],
              },
              {},
              {
                text: '',
                fontSize: 16,
                bold: true,
                border: [false, false, false, false],
              },
              {
                text: '',
                fontSize: 9,
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
      // Datos generales
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'FECHA DE SOLICITUD',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
              },
              {
                text: 'HORA DE SALIDA SUC',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'CLIENTE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'TELÉFONO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'RECIBE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
              {
                text: 'TELÉFONO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
      // Título dirección
      {
        table: {
          widths: '*',
          body: [
            [
              {
                text: 'DIRECCIÓN',
                fontSize: 10,
                bold: true,
                fillColor: '#A1A1A1',
                alignment: 'center',
                border: [true, true, true, false],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 0],
      },
      // Tabla de dirección
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'CALLE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'NÚMERO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'COLONIA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'CLAVE INTERPHONE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'ENTRE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'REFERENCIA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'NOTA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                colSpan: 3,
                border: [true, true, true, false],
              },
              {},
              {},
            ],
          ],
        },
      },
      //   Tipo de servicio
      {
        table: {
          widths: ['20%', '5%', '20%', '5%', '20%', '5%', '20%', '5%'],
          body: [
            [
              {
                text: 'MESA DE POSTRES',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                alignment: 'center',
                border: [true, true, true, false],
              },
              {
                text: 'MESA DE QUESOS',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                alignment: 'center',
                border: [true, true, true, false],
              },
              {
                text: 'EMPLATADO',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                alignment: 'center',
                border: [true, true, true, false],
              },
              {
                text: 'PASTEL',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                alignment: 'center',
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
      // Datos del evento
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'HORA DEL EVENTO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'PERSONA DE MONTAJE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'HORA DE MONTAJE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
              {
                text: 'ATENDIÓ',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
      // Título descripción del pedido
      {
        table: {
          widths: '*',
          body: [
            [
              {
                text: 'DESCRIPCIÓN DEL PEDIDO',
                fontSize: 10,
                bold: true,
                fillColor: '#A1A1A1',
                alignment: 'center',
                border: [true, true, true, false],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 0],
      },
      // Tabla de descripción del pedido
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'TIPO DE MESA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'CANTIDAD DE PERSONAS',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'DETALLES DEL PEDIDO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                colSpan: 3,
                border: [true, true, true, false],
              },
              {},
              {},
            ],
          ],
        },
      },
      // Título detalles pastel
      {
        table: {
          widths: '*',
          body: [
            [
              {
                text: 'PASTEL',
                fontSize: 10,
                bold: true,
                fillColor: '#A1A1A1',
                alignment: 'center',
                border: [true, true, true, false],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 0],
      },
      // Tabla de detalles pastel
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'FOTO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              {
                text: '#______  SI  |  NO',
                fontSize: 9,
                bold: true,
              },
              {
                text: '"ESCRITO"',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
              },
            ],
            [
              {
                text: 'TAMAÑO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'ESTILO Y COLOR DEL ESCRITO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'SABOR DE PAN',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'UBICACIÓN DEL ESCRITO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'RELLENO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'ESTILO Y COLOR DE POMPEADO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'CUBIERTA SABOR',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'POSICIÓN POMPEADO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'TIPO DE CUBIERTA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
              {
                text: 'DESCRIPCIÓN',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
      // Firma de confirmación del cliente y de recibido
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'FIRMA Y CONFIRMACIÓN DEL CLIENTE',
                colSpan: 3,
                fillColor: '#CFCFCF',
                fontSize: 9,
                bold: true,
                border: [true, true, true, false],
              },
              {},
              {},
              { text: '', border: [true, true, true, false] },
            ],
          ],
        },
      },
      // Tabla de totales
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'TOTAL POSTRES',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'ANTICIPO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'SERVICIO MONTAJE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'TICKET | TRANSFERENCIA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              { text: 'TOTAL', fontSize: 9, bold: true, fillColor: '#CFCFCF' },
              { text: '', fontSize: 9, bold: false },
              { text: 'FECHA', fontSize: 9, bold: true, fillColor: '#CFCFCF' },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'FACTURA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: 'SI | NO',
                fontSize: 9,
                bold: false,
                alignment: 'center',
                border: [true, true, true, false],
              },
              {
                text: 'DEBE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
      //Datos de liquidación
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              {
                text: 'FECHA DE LIQUIDACIÓN',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [true, true, false, true],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                colSpan: 3,
                fillColor: '#A1A1A1',
                border: [false, true, true, true],
              },
              {},
              {},
            ],
            [
              {
                text: 'TOTAL A LIQUIDAR',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [true, true, false, true],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                fillColor: '#A1A1A1',
                border: [false, true, true, true],
              },
              {
                text: 'TICKET | TRANSFERENCIA',
                fillColor: '#A1A1A1',
                fontSize: 9,
                bold: true,
                border: [false, true, false, true],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                fillColor: '#A1A1A1',
                border: [false, true, true, true],
              },
            ],
          ],
        },
      },
    ],
  };

  return docDefinition;
};
