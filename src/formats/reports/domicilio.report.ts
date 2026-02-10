import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const getDomicilioReport = (): TDocumentDefinitions => {
  const docDefintion: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [30, 30, 30, 30],
    content: [
      // Encabezado
      {
        columns: [
          {
            stack: [
              { text: 'SERVICIO A DOMICILIO', fontSize: 14 },
              { text: 'PATELERIA MAGNOLIAS', fontSize: 14 },
            ],
            width: 'auto',
          },
          { text: '', width: '*' },
          {
            text: 'SUCURSAL NAVARRETE',
            fontSize: 14,
            alignment: 'right',
          },
        ],
      },
      // Fecha de entrega
      {
        text: 'FECHA DE ENTREGA:',
        fontSize: 22,
        bold: true,
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          widths: ['20%', '30%', '20%', '30%'],
          body: [
            [
              {
                text: 'FECHA DE SOLICITUD',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'HORA DE ENTREGA',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'CLIENTE',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'LISTO A LA HORA',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'RECIBE',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'TELÉFONO',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: '',
                fontSize: 12,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 12,
                bold: true,
                border: [true, true, true, false],
              },
              {
                text: 'TELÉFONO',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              {},
            ],
            [
              {
                text: 'FOTO',
                fontSize: 12,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, false, true, false],
              },
              {
                text: '',
                fontSize: 12,
                bold: true,
                border: [true, false, true, false],
              },
              {
                text: 'ATENDIÓ',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
                rowSpan: 2,
                border: [true, false, true, false],
              },
              {
                text: '',
                fontSize: 10,
                bold: false,
                rowSpan: 2,
                border: [true, false, true, false],
              },
            ],
            [
              {
                text: '',
                fontSize: 12,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, false, true, false],
              },
              {
                text: '#______  SI  |  NO',
                fontSize: 10,
                bold: true,
                border: [true, false, true, false],
              },
              {},
              {},
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
                fontSize: 9,
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
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'NÚMERO',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'COLONIA',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'CLAVE INTERPHONE',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'ENTRE',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'REFERENCIA',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'NOTA',
                fontSize: 10,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 10,
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
      // Título descripción del pedido
      {
        table: {
          widths: '*',
          body: [
            [
              {
                text: 'DESCRIPCIÓN DEL PEDIDO',
                fontSize: 9,
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
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'CUBIERTA SABOR',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'SABOR DE PAN',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'TIPO DE CUBIERTA',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'RELLENO',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: '"ESCRITO"',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'ESTILO Y COLOR DEL ESCRITO',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
              {
                text: 'UBICACIÓN DEL ESCRITO',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
              },
              { text: '', fontSize: 10, bold: false },
            ],
            [
              {
                text: 'ESTILO Y COLOR DE POMPEADO',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 10,
                bold: false,
                border: [true, true, true, false],
              },
              {
                text: 'POSICIÓN POMPEADO',
                fontSize: 11,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, true, true, false],
              },
              {
                text: '',
                fontSize: 10,
                bold: false,
                border: [true, true, true, false],
              },
            ],
          ],
        },
      },
    ],
  };

  return docDefintion;
};
