import { Injectable } from '@nestjs/common';

import * as pdfMake from 'pdfmake';
import type {
  BufferOptions,
  TDocumentDefinitions,
  TCreatedPdf,
} from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
};

@Injectable()
export class PrinterService {
  constructor() {
    pdfMake.addFonts(fonts);
  }

  createPdf(
    docDefinition: TDocumentDefinitions,
    options?: BufferOptions,
  ): TCreatedPdf {
    return pdfMake.createPdf(docDefinition, options);
  }
}
