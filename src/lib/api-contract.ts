export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function isPaginationMeta(value: unknown): value is PaginationMeta {
  return (
    typeof value === "object" &&
    value !== null &&
    "page" in value &&
    "limit" in value &&
    "total" in value &&
    "totalPages" in value &&
    typeof value.page === "number" &&
    typeof value.limit === "number" &&
    typeof value.total === "number" &&
    typeof value.totalPages === "number"
  );
}
