import type {
  EventLocationType,
  EventPricingType,
  EventSortBy,
  EventSortOrder,
  PublicEventsQuery,
} from "@/lib/event-contract";

const SORT_BY_VALUES = ["startsAt", "createdAt", "updatedAt", "title"] as const;
const SORT_ORDER_VALUES = ["asc", "desc"] as const;
const PRICING_VALUES = ["FREE", "PAID"] as const;
const LOCATION_VALUES = ["ONLINE", "OFFLINE"] as const;
const LIMIT_VALUES = [6, 9, 12] as const;
const DEFAULT_EVENTS_PAGE = 1;
const DEFAULT_EVENTS_LIMIT = 9;
const DEFAULT_EVENTS_SORT_BY: EventSortBy = "startsAt";
const DEFAULT_EVENTS_SORT_ORDER: EventSortOrder = "asc";

type ResolvedPublicEventsQuery = Required<
  Pick<PublicEventsQuery, "page" | "limit" | "sortBy" | "sortOrder">
> &
  Pick<PublicEventsQuery, "searchTerm" | "pricingType" | "locationType">;

type EventsQuerySearchParams = {
  searchTerm?: string | null;
  page?: string | null;
  limit?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  pricingType?: string | null;
  locationType?: string | null;
};

type SearchParamsReader = {
  get(key: string): string | null;
};

function buildEventsHref(query: PublicEventsQuery) {
  const searchParams = new URLSearchParams();

  if (query.searchTerm?.trim()) {
    searchParams.set("searchTerm", query.searchTerm.trim());
  }

  if (query.pricingType) {
    searchParams.set("pricingType", query.pricingType);
  }

  if (query.locationType) {
    searchParams.set("locationType", query.locationType);
  }

  if (query.page && query.page !== DEFAULT_EVENTS_PAGE) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit && query.limit !== DEFAULT_EVENTS_LIMIT) {
    searchParams.set("limit", String(query.limit));
  }

  if (query.sortBy && query.sortBy !== DEFAULT_EVENTS_SORT_BY) {
    searchParams.set("sortBy", query.sortBy);
  }

  if (query.sortOrder && query.sortOrder !== DEFAULT_EVENTS_SORT_ORDER) {
    searchParams.set("sortOrder", query.sortOrder);
  }

  const result = searchParams.toString();
  return result ? `/events?${result}` : "/events";
}

function resolveEventsQuery(
  searchParams: EventsQuerySearchParams
): ResolvedPublicEventsQuery {
  return {
    searchTerm: normalizeSearchTerm(searchParams.searchTerm),
    page: normalizePage(searchParams.page),
    limit: normalizeLimit(searchParams.limit),
    sortBy: normalizeEnum<EventSortBy>(
      searchParams.sortBy,
      SORT_BY_VALUES,
      DEFAULT_EVENTS_SORT_BY
    ),
    sortOrder: normalizeEnum<EventSortOrder>(
      searchParams.sortOrder,
      SORT_ORDER_VALUES,
      DEFAULT_EVENTS_SORT_ORDER
    ),
    pricingType: normalizeOptionalEnum<EventPricingType>(
      searchParams.pricingType,
      PRICING_VALUES
    ),
    locationType: normalizeOptionalEnum<EventLocationType>(
      searchParams.locationType,
      LOCATION_VALUES
    ),
  };
}

function resolveEventsQueryFromSearchParams(searchParams: SearchParamsReader) {
  return resolveEventsQuery({
    searchTerm: searchParams.get("searchTerm"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sortBy: searchParams.get("sortBy"),
    sortOrder: searchParams.get("sortOrder"),
    pricingType: searchParams.get("pricingType"),
    locationType: searchParams.get("locationType"),
  });
}

function normalizeSearchTerm(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizePage(value: string | null | undefined) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return DEFAULT_EVENTS_PAGE;
  }

  return numericValue;
}

function normalizeLimit(value: string | null | undefined) {
  const numericValue = Number(value);

  if (LIMIT_VALUES.includes(numericValue as (typeof LIMIT_VALUES)[number])) {
    return numericValue;
  }

  return DEFAULT_EVENTS_LIMIT;
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
  buildEventsHref,
  DEFAULT_EVENTS_LIMIT,
  DEFAULT_EVENTS_PAGE,
  DEFAULT_EVENTS_SORT_BY,
  DEFAULT_EVENTS_SORT_ORDER,
  resolveEventsQuery,
  resolveEventsQueryFromSearchParams,
};
export type { ResolvedPublicEventsQuery };
