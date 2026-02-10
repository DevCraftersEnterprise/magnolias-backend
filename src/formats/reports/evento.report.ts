import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const getEventoReport = (): TDocumentDefinitions => {
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
                text: 'FECHA Y HR DE RECOLECCIÓN:',
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
    ],
  };

  return docDefinition;
};
