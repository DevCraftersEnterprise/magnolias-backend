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
          widths: ['25%', '25%', '25%', '25%'],
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
              },
              {
                text: '',
                fontSize: 10,
                bold: false,
                rowSpan: 2,
              },
            ],
            [
              {
                text: '',
                fontSize: 12,
                bold: true,
                fillColor: '#CFCFCF',
                border: [true, false, true, true],
              },
              {
                text: '#______  SI  |  NO',
                fontSize: 10,
                bold: true,
                border: [true, false, true, true],
              },
              {},
              {},
            ],
          ],
        },
      },
    ],
  };

  return docDefintion;
};
