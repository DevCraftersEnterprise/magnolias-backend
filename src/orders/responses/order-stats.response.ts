export class OrderStatsResponse {
  total: number;
  data: {
    created: number;
    in_process: number;
    done: number;
    in_delivery: number;
    delivered: number;
    cancelled: number;
    order_type_counts: {
      conFlores: number;
      enTienda: number;
      evento: number;
      domicilio: number;
    };
  };
}
