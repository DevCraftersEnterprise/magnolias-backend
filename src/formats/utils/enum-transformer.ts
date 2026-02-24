import { WritingLocation } from '../../common/enums/writing-location.enum';
import { PipingLocation } from '../../common/enums/piping-location.enum';
import { EventServiceType } from '../../common/enums/event-service-type.enum';
import { FrostingType } from '../../common/enums/frosting-type.enum';
import { PaymentMethod } from '../../common/enums/payment-methods.enum';
import { ProductSize } from '../../common/enums/product-size.enum';
import { TableType } from '../../common/enums/table-type.enum';

export class EnumTransformer {
  static translateWritingLocation(location: WritingLocation): string {
    const translations: Record<WritingLocation, string> = {
      [WritingLocation.TOP]: 'Parte superior',
      [WritingLocation.CENTER]: 'Centro',
      [WritingLocation.BOTTOM]: 'Parte inferior',
      [WritingLocation.SIDE]: 'Lado',
      [WritingLocation.PLAQUE]: 'Placa',
    };

    return translations[location] || 'Desconocido';
  }

  static translatePipingLocation(location: PipingLocation): string {
    const translations: Record<PipingLocation, string> = {
      [PipingLocation.TOP_BORDER]: 'Borde superior',
      [PipingLocation.BOTTOM_BORDER]: 'Borde inferior',
      [PipingLocation.FULL_BORDER]: 'Borde completo',
      [PipingLocation.CENTER]: 'Centro',
      [PipingLocation.FULL_DESING]: 'Diseño completo',
      [PipingLocation.NONE]: 'Ninguno',
    };

    return translations[location] || 'Desconocido';
  }

  static translateEventServiceType(type: EventServiceType): string {
    const translations: Record<EventServiceType, string> = {
      [EventServiceType.DESSERT_TABLE]: 'Mesa de postres',
      [EventServiceType.CHEESE_TABLE]: 'Mesa de quesos',
      [EventServiceType.PLATED]: 'Emplatado',
      [EventServiceType.CAKE]: 'Pastel',
    };

    return translations[type] || 'Desconocido';
  }

  static translateFrostingType(type: FrostingType): string {
    const translations: Record<FrostingType, string> = {
      [FrostingType.BUTTERCREAM]: 'Crema de mantequilla',
      [FrostingType.FONDANT]: 'Fondant',
      [FrostingType.WHIPPED_CREAM]: 'Crema batida',
      [FrostingType.GANACHE]: 'Ganache',
      [FrostingType.NAKED]: 'Pastel desnudo',
    };

    return translations[type] || 'Desconocido';
  }

  static translatePaymentMethod(method: PaymentMethod): string {
    const translations: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'Efectivo',
      [PaymentMethod.CARD]: 'Tarjeta',
      [PaymentMethod.TRANSFER]: 'Transferencia',
      [PaymentMethod.MIXED]: 'Mixto',
    };

    return translations[method] || 'Desconocido';
  }

  static translateProductSize(size: ProductSize): string {
    const translations: Record<ProductSize, string> = {
      [ProductSize.TEN_P]: '10 personas',
      [ProductSize.FIFTEEN_P]: '15 personas',
      [ProductSize.TWENTY_P]: '20 personas',
      [ProductSize.TWENTY_FIVE_P]: '25 personas',
      [ProductSize.THIRTY_P]: '30 personas',
      [ProductSize.FORTY_P]: '40 personas',
      [ProductSize.FIFTY_P]: '50 personas',
      [ProductSize.CUSTOM]: 'Personalizado',
    };

    return translations[size] || 'Desconocido';
  }

  static translateTableType(type: TableType): string {
    const translations: Record<TableType, string> = {
      [TableType.STANDARD]: 'Estándar',
      [TableType.RUSTIC]: 'Rústico',
      [TableType.VINTAGE]: 'Vintage',
      [TableType.MODERN]: 'Moderno',
      [TableType.CUSTOM]: 'Personalizado',
    };

    return translations[type] || 'Desconocido';
  }
}
