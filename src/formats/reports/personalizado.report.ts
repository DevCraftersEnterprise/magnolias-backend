import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Order } from '../../orders/entities/order.entity';
import { OrderDetail } from '../../orders/entities/order-detail.entity';
import {
  getPersonalizadoHeader,
  getSimpleCustomerSection,
  getDetailSectionTitle,
  getDetailTable,
  getDecorationSection,
  getConditionsSection,
  getSignatureSection,
  getPersonalizadoTotalsSection,
  pageBreak,
} from './helpers';

const generatePageContent = (
  order: Order,
  detail: OrderDetail | null,
  pageNumber: number,
  totalPages: number,
): Content[] => {
  return [
    getPersonalizadoHeader(order, pageNumber, totalPages),
    getSimpleCustomerSection(order, true),
    getDetailSectionTitle(),
    getDetailTable(detail),
    detail ? getDecorationSection(detail) : [],
    getConditionsSection('PERSONALIZADO'),
    getSignatureSection(false),
    getPersonalizadoTotalsSection(order),
  ];
};

export const getPersonalizadoReport = (order: Order): TDocumentDefinitions => {
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
