import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Order } from '../../orders/entities/order.entity';
import { OrderDetail } from '../../orders/entities/order-detail.entity';
import {
  getDomicilioHeader,
  getDomicilioCustomerSection,
  getAddressSection,
  getDetailSectionTitle,
  getDetailTable,
  getDecorationSection,
  getFlowersSection,
  getConditionsSection,
  getSignatureSection,
  getDomicilioTotalsSection,
  pageBreak,
} from './helpers';

/**
 * Genera el contenido de una página para un detalle específico
 */
const generatePageContent = (
  order: Order,
  detail: OrderDetail,
  pageNumber: number,
  totalPages: number,
  isLastPage: boolean,
): Content[] => {
  const content: Content[] = [];

  // Encabezado con número de página si hay múltiples
  content.push(getDomicilioHeader(order, pageNumber, totalPages));

  // Datos del cliente
  content.push(getDomicilioCustomerSection(order));

  // Dirección de entrega
  content.push(...getAddressSection(order));

  // Título descripción del pedido
  const detailTitle =
    totalPages > 1
      ? `DESCRIPCIÓN DEL PEDIDO - DETALLE ${pageNumber} DE ${totalPages}`
      : 'DESCRIPCIÓN DEL PEDIDO';
  content.push(getDetailSectionTitle(detailTitle));

  // Tabla de descripción del producto
  content.push(getDetailTable(detail));

  // Sección de decoración con SVG del pastel
  content.push(getDecorationSection(detail, false));

  // Flores (si hay) - Solo en primera página
  const flowersSection = getFlowersSection(order);
  if (flowersSection && pageNumber === 1) {
    content.push(flowersSection);
  }

  // Condiciones de servicio
  content.push(getConditionsSection('DOMICILIO'));

  // Firma del cliente y de recibido
  content.push(getSignatureSection(true));

  // Totales solo en la última página
  if (isLastPage) {
    content.push(getDomicilioTotalsSection(order));
  }

  return content;
};

/**
 * Genera el reporte de DOMICILIO
 * Si el pedido tiene múltiples detalles, genera una página por cada detalle
 */
export const getDomicilioReport = (order: Order): TDocumentDefinitions => {
  const details = order.details ?? [];
  const totalPages = Math.max(details.length, 1);

  const allContent: Content[] = [];

  if (details.length === 0) {
    // Si no hay detalles, generar una página con datos vacíos
    allContent.push(
      ...generatePageContent(order, {} as OrderDetail, 1, 1, true),
    );
  } else {
    details.forEach((detail, index) => {
      const pageNumber = index + 1;
      const isLastPage = pageNumber === totalPages;

      // Salto de página antes de cada detalle excepto el primero
      if (index > 0) {
        allContent.push(pageBreak());
      }

      allContent.push(
        ...generatePageContent(
          order,
          detail,
          pageNumber,
          totalPages,
          isLastPage,
        ),
      );
    });
  }

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 20, 20, 20],
    content: allContent,
  };
};
