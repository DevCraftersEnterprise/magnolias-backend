import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Order } from '../../orders/entities/order.entity';
import { OrderDetail } from '../../orders/entities/order-detail.entity';
import {
  getVitrinaHeader,
  getSimpleCustomerSection,
  getDetailTable,
  getDecorationSection,
  getConditionsSection,
  getSignatureSection,
  getVitrinaTotalsSection,
  pageBreak,
} from './helpers';

const generatePageContent = (
  order: Order,
  detail: OrderDetail | null,
  pageNumber: number,
  totalPages: number,
): Content[] => {
  return [
    getVitrinaHeader(order, pageNumber, totalPages),
    getSimpleCustomerSection(order),
    getDetailTable(detail),
    getDecorationSection(detail ?? ({} as OrderDetail), true),
    getConditionsSection('VITRINA'),
    getSignatureSection(),
    getVitrinaTotalsSection(order),
  ];
};

export const getVitrinaReport = (order: Order): TDocumentDefinitions => {
  const details = order.details ?? [];
  const totalPages = Math.max(details.length, 1);
  const allContent: Content[] = [];

  if (details.length === 0) {
    allContent.push(...generatePageContent(order, null, 1, 1));
  } else {
    details.forEach((detail, index) => {
      if (index > 0) {
        allContent.push(pageBreak());
      }
      allContent.push(
        ...generatePageContent(order, detail, index + 1, totalPages),
      );
    });
  }

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 20, 20, 20],
    content: allContent,
  };
};
