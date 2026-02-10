import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const getDomicilioReport = (): TDocumentDefinitions => {
  const docDefintion: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [30, 30, 30, 30],
    content: [
      // Encabezado
      {
        table: {
          widths: ['15%', '15%', '45%', '25%'],
          body: [
            [
              {
                text: 'SERVICIO A DOMICILIO',
                fontSize: 10,
                colSpan: 3,
                border: [true, true, false, false],
              },
              {},
              {},
              {
                text: 'SUCURSAL NAVARRETE',
                fontSize: 10,
                border: [false, true, true, false],
              },
            ],
            [
              {
                text: 'PASTELERÍA MAGNOLIAS',
                fontSize: 10,
                colSpan: 4,
                border: [true, false, true, false],
              },
              {},
              {},
              {},
            ],
            [
              {
                text: 'FECHA DE ENTREGA:',
                fontSize: 16,
                bold: true,
                colSpan: 2,
                border: [true, false, false, false],
              },
              {},
              {
                text: '',
                fontSize: 16,
                bold: false,
                colSpan: 2,
                border: [false, false, true, false],
              },
              {},
            ],
          ],
        },
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
      // Decoración y notas adicionales
      {
        table: {
          widths: ['25%', '20%', '30%', '25%'],
          heights: [50, 50],
          body: [
            [
              {
                svg: `<svg xmlns="http://www.w3.org/2000/svg" width="314.667" height="476"
    preserveAspectRatio="xMidYMid meet" viewBox="0 0 236 357">
    <path fill="#000"
        d="M91.2 7C81 8.3 67.7 11.6 63.1 14c-7.2 3.6-7.1 3-7.1 36 0 33.8-.3 32.7 8.5 36.6 18.7 8.2 64.3 9.9 92.3 3.4 8.9-2.1 13.4-4.1 17-7.3 2.2-2 2.2-2.2 2.2-32.7 0-23-.3-31-1.2-32.1-3.2-3.9-11.4-7-24.8-9.5-10.1-1.9-47.7-2.7-58.8-1.4m61 2.9C166 12.7 175 17 175 20.7c0 4.5-10.4 9-28 12-13.2 2.3-48.8 2.3-62 0-18.6-3.2-26.5-6.9-26.5-12.2 0-2.6.7-3.3 5.4-5.6 5.7-2.8 16.5-5.5 27.8-6.9 12.1-1.5 49.5-.4 60.5 1.9M72 30.9c4.1 1.1 11.1 2.6 15.5 3.2 10.2 1.7 46.5 1.7 57 .1 11.6-1.8 23-5.1 27.1-7.8L175 24l-.2 28.7-.3 28.6-2.5 1.8c-3.6 2.7-12.2 5.5-23 7.5-12.2 2.3-49.1 2.6-62.5.5-11.9-1.8-23.6-5.5-26.8-8.5L57 80.1V24l3.8 2.4c2 1.4 7.1 3.4 11.2 4.5m18.7 92.2c-20.2 1.8-38 6.2-44.1 11l-2.6 2v33.4c0 18.3.3 34.1.6 35 1.6 4 16.3 8.9 34.9 11.7 14.3 2.1 63.1 1.8 77-.6 15-2.5 26.2-6.1 29.7-9.6l2.8-2.8v-32.1c0-21.2-.4-32.8-1.1-34.4-2.3-5.1-15.1-9.6-34.6-12.3-13.6-1.8-48.4-2.6-62.6-1.3m62.5 2.3c21.2 2.9 33 7.4 33.6 12.8 2 17-108.8 21.4-137.3 5.5-5.5-3.1-6-6.8-1.3-9.7 7.4-4.5 23.5-8.2 43.6-10 13.1-1.2 48.2-.4 61.4 1.4m-90.7 24.1c33.3 8.5 99.5 6.1 119.7-4.4l5.8-3v30c0 17.1-.4 30.8-1 31.8-1.4 2.7-12.1 7.1-22.3 9.2-15.4 3.1-32 4.2-56.5 3.6-33.1-.8-53.6-4.6-61.4-11.5-1.6-1.4-1.8-4.2-1.8-32.2v-30.7l5.8 2.9c3.1 1.5 8.4 3.5 11.7 4.3M78 247.1c-21.9 1.5-42 5-45.6 8-1.1.9-1.4 6.9-1.4 31.1 0 27.5-.1 29.9-1.7 30.5-10 3.4-18.3 9.1-18.3 12.5 0 2.3 6.9 7.6 12.5 9.7 16.8 6.4 45.2 10.1 82.5 10.8 49 1 88.3-3.7 106.7-12.8 6.8-3.3 8.8-5.7 7.9-9.5-.8-3-7.7-7.6-14.1-9.4l-4.5-1.3v-29.8c0-33.6.4-31.8-8-34.3-18.4-5.5-75.5-8.2-116-5.5m73.5.9c56.9 3.8 65 12.4 16.5 17.4-51.6 5.4-136 .5-136-7.9 0-3.9 22.3-8 53.5-9.8 12.5-.8 52.4-.6 66 .3M36.2 261.4c1.9.8 7.5 2.2 12.4 3 40.1 6.8 120.6 5.4 145.7-2.4 3.4-1.1 6.3-2 6.5-2 .1 0 .2 14.1.2 31.3 0 36.3.8 33.6-10.5 36.3-13.9 3.2-30 4.5-63 5.1-44.9.8-79.6-1.9-91.7-7l-3.8-1.6v-32c0-17.7.2-32.1.4-32.1s1.9.6 3.8 1.4m-5.2 60c0 3 .4 3.6 4.1 5 13.3 5.4 33.6 7.1 81.9 7.1 41.9 0 60-1.3 74.6-5.1 8.1-2.1 10.4-3.7 10.4-7.5 0-2.8.3-3 2.3-2.5 7.6 1.9 15.7 7.4 15.7 10.6 0 6.1-16.9 12.3-44.6 16.4-37.4 5.5-99.8 4.4-133-2.4-29.9-6.2-37.7-14.4-21-22.1 8.3-3.8 9.6-3.7 9.6.5" />
</svg>`,
                width: 100,
                alignment: 'center',
                rowSpan: 2,
              },
              {
                text: 'DECORACIÓN',
                fontSize: 11,
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
                fontSize: 11,
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
                    text: 'CONDICIONES DE SERVICIO: ',
                    fontSize: 11,
                    bold: true,
                    color: 'red',
                  },
                  {
                    text: 'Los tonos, técnicas, tipos de flores, dulces, chocolates, frutas y diseños de dibujos son aproximados y pueden variar respecto a la imagen de referencia. Al aceptor estos términos, se deberá firmar la casilla correspondiente como consentimiento para proceder con el servicio.',
                    fontSize: 10,
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
                bold: true,
                border: [true, true, true, false],
              },
              {},
              {},
              { text: '', border: [true, true, true, false] },
            ],
            [
              {
                text: 'FIRMA DE RECIBIDO',
                colSpan: 3,
                fillColor: '#CFCFCF',
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
    ],
  };

  return docDefintion;
};
