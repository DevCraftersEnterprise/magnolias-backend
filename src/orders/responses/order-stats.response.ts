export class OrderStatsResponse {
    total: number;
    data: {
        created: number;
        in_process: number;
        done: number;
        delivered: number;
        cancelled: number;
    }
}