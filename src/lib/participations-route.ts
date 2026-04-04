import type {
  ParticipantStatus,
  ParticipationJoinType,
} from "@/lib/dashboard-contract";

const PARTICIPATION_STATUS_VALUES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "BANNED",
  "CANCELLED",
] as const satisfies ReadonlyArray<ParticipantStatus>;
const PARTICIPATION_JOIN_TYPE_VALUES = [
  "DIRECT",
  "REQUEST",
  "INVITED",
] as const satisfies ReadonlyArray<ParticipationJoinType>;
const PARTICIPATION_SORT_BY_VALUES = [
  "updatedAt",
  "createdAt",
  "joinedAt",
  "startsAt",
] as const;
const SORT_ORDER_VALUES = ["asc", "desc"] as const;

const DEFAULT_PARTICIPATIONS_PAGE = 1;
const DEFAULT_PARTICIPATIONS_LIMIT = 10;
const DEFAULT_PARTICIPATIONS_SORT_BY = "updatedAt";
const DEFAULT_PARTICIPATIONS_SORT_ORDER = "desc";

type ParticipationSortBy = (typeof PARTICIPATION_SORT_BY_VALUES)[number];
type ParticipationSortOrder = (typeof SORT_ORDER_VALUES)[number];

type ResolvedParticipationsQuery = {
  page: number;
  limit: number;
  sortBy: ParticipationSortBy;
  sortOrder: ParticipationSortOrder;
  searchTerm?: string;
  status?: ParticipantStatus;
  joinType?: ParticipationJoinType;
};

type ParticipationsQuerySearchParams = {
  page?: string | null;
  limit?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  searchTerm?: string | null;
  status?: string | null;
  joinType?: string | null;
};

type SearchParamsReader = {
  get(key: string): string | null;
};

function buildParticipationsHref(query: Partial<ResolvedParticipationsQuery>) {
  const searchParams = new URLSearchParams();

  if (query.searchTerm?.trim()) {
    searchParams.set("searchTerm", query.searchTerm.trim());
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.joinType) {
    searchParams.set("joinType", query.joinType);
  }

  if (query.page && query.page !== DEFAULT_PARTICIPATIONS_PAGE) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit && query.limit !== DEFAULT_PARTICIPATIONS_LIMIT) {
    searchParams.set("limit", String(query.limit));
  }

  if (query.sortBy && query.sortBy !== DEFAULT_PARTICIPATIONS_SORT_BY) {
    searchParams.set("sortBy", query.sortBy);
  }

  if (query.sortOrder && query.sortOrder !== DEFAULT_PARTICIPATIONS_SORT_ORDER) {
    searchParams.set("sortOrder", query.sortOrder);
  }

  const result = searchParams.toString();
  return result ? `/dashboard/participations?${result}` : "/dashboard/participations";
}

function resolveParticipationsQuery(
  searchParams: ParticipationsQuerySearchParams
): ResolvedParticipationsQuery {
  return {
    page: normalizePositiveInteger(
      searchParams.page,
      DEFAULT_PARTICIPATIONS_PAGE
    ),
    limit: normalizePositiveInteger(
      searchParams.limit,
      DEFAULT_PARTICIPATIONS_LIMIT
    ),
    sortBy: normalizeEnum(
      searchParams.sortBy,
      PARTICIPATION_SORT_BY_VALUES,
      DEFAULT_PARTICIPATIONS_SORT_BY
    ),
    sortOrder: normalizeEnum(
      searchParams.sortOrder,
      SORT_ORDER_VALUES,
      DEFAULT_PARTICIPATIONS_SORT_ORDER
    ),
    searchTerm: normalizeSearchTerm(searchParams.searchTerm),
    status: normalizeOptionalEnum(
      searchParams.status,
      PARTICIPATION_STATUS_VALUES
    ),
    joinType: normalizeOptionalEnum(
      searchParams.joinType,
      PARTICIPATION_JOIN_TYPE_VALUES
    ),
  };
}

function resolveParticipationsQueryFromSearchParams(searchParams: SearchParamsReader) {
  return resolveParticipationsQuery({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sortBy: searchParams.get("sortBy"),
    sortOrder: searchParams.get("sortOrder"),
    searchTerm: searchParams.get("searchTerm"),
    status: searchParams.get("status"),
    joinType: searchParams.get("joinType"),
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
  buildParticipationsHref,
  DEFAULT_PARTICIPATIONS_LIMIT,
  DEFAULT_PARTICIPATIONS_PAGE,
  DEFAULT_PARTICIPATIONS_SORT_BY,
  DEFAULT_PARTICIPATIONS_SORT_ORDER,
  resolveParticipationsQuery,
  resolveParticipationsQueryFromSearchParams,
};
export type {
  ParticipationSortBy,
  ParticipationSortOrder,
  ResolvedParticipationsQuery,
};
