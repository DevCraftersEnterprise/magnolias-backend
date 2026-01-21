export interface PaginationResponse<T> {
  items: Array<T>;
  total: number;
  pagination: {
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
  };
}
