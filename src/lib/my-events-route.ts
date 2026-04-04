import type {
  EventStatus,
  EventVisibility,
} from "@/lib/dashboard-contract";

const EVENT_STATUS_VALUES = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
] as const satisfies ReadonlyArray<EventStatus>;
const EVENT_VISIBILITY_VALUES = [
  "PUBLIC",
  "PRIVATE",
] as const satisfies ReadonlyArray<EventVisibility>;
const MY_EVENTS_SORT_BY_VALUES = [
  "updatedAt",
  "startsAt",
  "createdAt",
  "title",
] as const;
const SORT_ORDER_VALUES = ["asc", "desc"] as const;

const DEFAULT_MY_EVENTS_PAGE = 1;
const DEFAULT_MY_EVENTS_LIMIT = 9;
const DEFAULT_MY_EVENTS_SORT_BY = "updatedAt";
const DEFAULT_MY_EVENTS_SORT_ORDER = "desc";

type MyEventsSortBy = (typeof MY_EVENTS_SORT_BY_VALUES)[number];
type MyEventsSortOrder = (typeof SORT_ORDER_VALUES)[number];

type ResolvedMyEventsQuery = {
  page: number;
  limit: number;
  sortBy: MyEventsSortBy;
  sortOrder: MyEventsSortOrder;
  searchTerm?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
};

type MyEventsQuerySearchParams = {
  page?: string | null;
  limit?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  searchTerm?: string | null;
  status?: string | null;
  visibility?: string | null;
};

type SearchParamsReader = {
  get(key: string): string | null;
};

function buildMyEventsHref(query: Partial<ResolvedMyEventsQuery>) {
  const searchParams = new URLSearchParams();

  if (query.searchTerm?.trim()) {
    searchParams.set("searchTerm", query.searchTerm.trim());
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.visibility) {
    searchParams.set("visibility", query.visibility);
  }

  if (query.page && query.page !== DEFAULT_MY_EVENTS_PAGE) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit && query.limit !== DEFAULT_MY_EVENTS_LIMIT) {
    searchParams.set("limit", String(query.limit));
  }

  if (query.sortBy && query.sortBy !== DEFAULT_MY_EVENTS_SORT_BY) {
    searchParams.set("sortBy", query.sortBy);
  }

  if (query.sortOrder && query.sortOrder !== DEFAULT_MY_EVENTS_SORT_ORDER) {
    searchParams.set("sortOrder", query.sortOrder);
  }

  const result = searchParams.toString();
  return result ? `/dashboard/my-events?${result}` : "/dashboard/my-events";
}

function resolveMyEventsQuery(
  searchParams: MyEventsQuerySearchParams
): ResolvedMyEventsQuery {
  return {
    page: normalizePositiveInteger(searchParams.page, DEFAULT_MY_EVENTS_PAGE),
    limit: normalizePositiveInteger(searchParams.limit, DEFAULT_MY_EVENTS_LIMIT),
    sortBy: normalizeEnum(
      searchParams.sortBy,
      MY_EVENTS_SORT_BY_VALUES,
      DEFAULT_MY_EVENTS_SORT_BY
    ),
    sortOrder: normalizeEnum(
      searchParams.sortOrder,
      SORT_ORDER_VALUES,
      DEFAULT_MY_EVENTS_SORT_ORDER
    ),
    searchTerm: normalizeSearchTerm(searchParams.searchTerm),
    status: normalizeOptionalEnum(searchParams.status, EVENT_STATUS_VALUES),
    visibility: normalizeOptionalEnum(
      searchParams.visibility,
      EVENT_VISIBILITY_VALUES
    ),
  };
}

function resolveMyEventsQueryFromSearchParams(searchParams: SearchParamsReader) {
  return resolveMyEventsQuery({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sortBy: searchParams.get("sortBy"),
    sortOrder: searchParams.get("sortOrder"),
    searchTerm: searchParams.get("searchTerm"),
    status: searchParams.get("status"),
    visibility: searchParams.get("visibility"),
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
  buildMyEventsHref,
  DEFAULT_MY_EVENTS_LIMIT,
  DEFAULT_MY_EVENTS_PAGE,
  DEFAULT_MY_EVENTS_SORT_BY,
  DEFAULT_MY_EVENTS_SORT_ORDER,
  resolveMyEventsQuery,
  resolveMyEventsQueryFromSearchParams,
};
export type { MyEventsSortBy, MyEventsSortOrder, ResolvedMyEventsQuery };
