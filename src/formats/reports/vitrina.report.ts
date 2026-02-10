import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Order } from '../../orders/entities/order.entity';

export const getVitrinaReport = (order: Order): TDocumentDefinitions => {
  const docDefintion: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [20, 20, 20, 20],
    content: [
      // Encabezado
      {
        table: {
          widths: '*',
          body: [
            [
              {
                text: 'SUCURSAL NAVARRETE - PASTELERÍA MAGNOLIAS',
                fontSize: 10,
                bold: true,
                fillColor: '#585858',
                color: 'white',
                alignment: 'center',
                border: [true, true, true, false],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 0],
      },
      // Datos del cliente
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
                text: 'HORA DE ENTREGA',
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
                text: '',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: true,
                border: [true, true, true, false],
              },
              {
                text: '',
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
            [
              {
                text: 'FOTO',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, false, true, false],
              },
              {
                text: '',
                fontSize: 10,
                bold: true,
                border: [true, false, true, false],
              },
              {
                text: 'ATENDIÓ',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                rowSpan: 2,
                border: [true, false, true, false],
              },
              {
                text: '',
                fontSize: 9,
                bold: false,
                rowSpan: 2,
                border: [true, false, true, false],
              },
            ],
            [
              {
                text: '',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, false, true, false],
              },
              {
                text: '#______  SI  |  NO',
                fontSize: 9,
                bold: true,
                border: [true, false, true, false],
              },
              {},
              {},
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
                text: 'TAMAÑO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'CUBIERTA SABOR',
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
                text: 'TIPO DE CUBIERTA',
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
                text: '"ESCRITO"',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'ESTILO Y COLOR DEL ESCRITO',
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
                text: 'ESTILO Y COLOR DE POMPEADO',
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
                text: 'POSICIÓN POMPEADO',
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
      // Decoración y notas adicionales
      {
        table: {
          widths: ['30%', '20%', '30%', '20%'],
          heights: [40, 30],
          body: [
            [
              {
                svg: `<svg xmlns="http://www.w3.org/2000/svg" width="155pt" height="89pt" preserveAspectRatio="xMidYMid meet" viewBox="0 0 155 89"><ellipse cx="77.5" cy="12" fill="none" stroke="#000" stroke-width="1.5" rx="50" ry="8"/><path stroke="#000" stroke-width="1.5" d="M27.5 12v50m100-50v50"/><path fill="none" stroke="#000" stroke-width="1.5" d="M27.5 62a50 8 0 0 0 100 0"/><path fill="none" stroke="#000" stroke-width="1.5" d="M12.5 70a65 10 0 0 0 130 0m-130 0a65 10 0 0 1 15-6.4m100 0a65 10 0 0 1 15 6.4"/></svg>`,
                width: 150,
                alignment: 'center',
                rowSpan: 2,
              },
              {
                text: 'DECORACIÓN',
                fontSize: 10,
                bold: true,
                border: [true, true, false, true],
              },
              {
                text: '',
                fontSize: 10,
                bold: false,
                colSpan: 2,
                border: [false, true, true, true],
              },
              {},
            ],
            [
              {},
              {
                text: 'NOTAS ADICIONALES',
                fontSize: 10,
                bold: true,
                border: [true, true, false, true],
              },
              {
                text: '',
                fontSize: 10,
                bold: false,
                colSpan: 2,
                border: [false, true, true, true],
              },
              {},
            ],
          ],
        },
      },
      // Condiciones de servicio
      {
        table: {
          widths: '*',
          body: [
            [
              {
                text: [
                  {
                    text: 'EN CASO DE CAMBIOS -> CONDICIONES DE SERVICIO: ',
                    fontSize: 9,
                    bold: true,
                    color: 'red',
                  },
                  {
                    text: 'Acepto los cambios solicitados en producto de vitrina como pan, relleno, tamaño, decoración, etc. Entiendo que el producto final puede variar en sabor, tamaño, o alteraciones adicionales al producto original en tienda.',
                    fontSize: 9,
                    bold: false,
                    color: 'black',
                  },
                ],
                fillColor: '#CFCFCF',
                border: [true, false, true, false],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 0],
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
                text: 'COSTO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: 'DEBE',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: 'ANTICIPO',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              { text: 'PAGADO', fontSize: 9, bold: true, fillColor: '#CFCFCF' },
              { text: '', fontSize: 9, bold: false },
            ],
            [
              {
                text: '# TICKET | TRANSFERENCIA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 9, bold: false },
              {
                text: '# TICKET | TRANSFERENCIA',
                fontSize: 9,
                bold: true,
                fillColor: '#CFCFCF',
              },
              {
                text: 'SI | NO',
                fontSize: 9,
                bold: false,
                alignment: 'center',
              },
            ],
          ],
        },
      },
    ],
  };

  return docDefintion;
};
