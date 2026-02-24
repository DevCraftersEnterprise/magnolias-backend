export class OrderStatsDto {
 
  total: number;

  statuses: {
    created: number;
    in_process: number;
    done: number;
    cancelled: number;
  };
}