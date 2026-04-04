import type {
  PaymentPurpose,
  PaymentStatus,
  PaymentsQuery,
} from "@/lib/dashboard-contract";

const PAYMENT_STATUS_VALUES = [
  "PENDING",
  "PAID",
  "UNPAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const satisfies ReadonlyArray<PaymentStatus>;
const PAYMENT_PURPOSE_VALUES = [
  "EVENT_REGISTRATION",
  "INVITATION_ACCEPTANCE",
] as const satisfies ReadonlyArray<PaymentPurpose>;
const PAYMENTS_SORT_BY_VALUES = [
  "createdAt",
  "updatedAt",
  "paidAt",
  "amount",
] as const;
const SORT_ORDER_VALUES = ["asc", "desc"] as const;

const DEFAULT_PAYMENTS_PAGE = 1;
const DEFAULT_PAYMENTS_LIMIT = 10;
const DEFAULT_PAYMENTS_SORT_BY = "createdAt";
const DEFAULT_PAYMENTS_SORT_ORDER = "desc";

type PaymentsSortBy = (typeof PAYMENTS_SORT_BY_VALUES)[number];
type PaymentsSortOrder = (typeof SORT_ORDER_VALUES)[number];
type ResolvedPaymentsQuery = PaymentsQuery;

type PaymentsQuerySearchParams = {
  page?: string | null;
  limit?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  searchTerm?: string | null;
  status?: string | null;
  purpose?: string | null;
};

type SearchParamsReader = {
  get(key: string): string | null;
};

function buildPaymentsHref(query: Partial<ResolvedPaymentsQuery>) {
  const searchParams = new URLSearchParams();

  if (query.searchTerm?.trim()) {
    searchParams.set("searchTerm", query.searchTerm.trim());
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.purpose) {
    searchParams.set("purpose", query.purpose);
  }

  if (query.page && query.page !== DEFAULT_PAYMENTS_PAGE) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit && query.limit !== DEFAULT_PAYMENTS_LIMIT) {
    searchParams.set("limit", String(query.limit));
  }

  if (query.sortBy && query.sortBy !== DEFAULT_PAYMENTS_SORT_BY) {
    searchParams.set("sortBy", query.sortBy);
  }

  if (query.sortOrder && query.sortOrder !== DEFAULT_PAYMENTS_SORT_ORDER) {
    searchParams.set("sortOrder", query.sortOrder);
  }

  const result = searchParams.toString();
  return result ? `/dashboard/payments?${result}` : "/dashboard/payments";
}

function resolvePaymentsQuery(
  searchParams: PaymentsQuerySearchParams
): ResolvedPaymentsQuery {
  return {
    page: normalizePositiveInteger(searchParams.page, DEFAULT_PAYMENTS_PAGE),
    limit: normalizePositiveInteger(searchParams.limit, DEFAULT_PAYMENTS_LIMIT),
    sortBy: normalizeEnum(
      searchParams.sortBy,
      PAYMENTS_SORT_BY_VALUES,
      DEFAULT_PAYMENTS_SORT_BY
    ),
    sortOrder: normalizeEnum(
      searchParams.sortOrder,
      SORT_ORDER_VALUES,
      DEFAULT_PAYMENTS_SORT_ORDER
    ),
    searchTerm: normalizeSearchTerm(searchParams.searchTerm),
    status: normalizeOptionalEnum(searchParams.status, PAYMENT_STATUS_VALUES),
    purpose: normalizeOptionalEnum(searchParams.purpose, PAYMENT_PURPOSE_VALUES),
  };
}

function resolvePaymentsQueryFromSearchParams(searchParams: SearchParamsReader) {
  return resolvePaymentsQuery({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sortBy: searchParams.get("sortBy"),
    sortOrder: searchParams.get("sortOrder"),
    searchTerm: searchParams.get("searchTerm"),
    status: searchParams.get("status"),
    purpose: searchParams.get("purpose"),
  });
}

function normalizeSearchTerm(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizePositiveInteger(value: string | null | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeEnum<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
  fallback: T
) {
  if (value && allowedValues.includes(value as T)) {
    return value as T;
  }

  return fallback;
}

function normalizeOptionalEnum<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[]
) {
  if (value && allowedValues.includes(value as T)) {
    return value as T;
  }

  return undefined;
}

export {
  buildPaymentsHref,
  DEFAULT_PAYMENTS_LIMIT,
  DEFAULT_PAYMENTS_PAGE,
  DEFAULT_PAYMENTS_SORT_BY,
  DEFAULT_PAYMENTS_SORT_ORDER,
  resolvePaymentsQuery,
  resolvePaymentsQueryFromSearchParams,
};
export type { PaymentsSortBy, PaymentsSortOrder, ResolvedPaymentsQuery };
