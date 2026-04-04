import type { InvitationStatus } from "@/lib/dashboard-contract";

const INVITATION_STATUS_VALUES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
] as const satisfies ReadonlyArray<InvitationStatus>;
const INVITATIONS_TAB_VALUES = ["received", "sent"] as const;

const DEFAULT_INVITATIONS_TAB = "received";
const DEFAULT_INVITATIONS_PAGE = 1;
const DEFAULT_INVITATIONS_LIMIT = 10;
const DEFAULT_RECEIVED_INVITATION_STATUS = "PENDING";

type InvitationsTab = (typeof INVITATIONS_TAB_VALUES)[number];

type ResolvedInvitationsQuery = {
  tab: InvitationsTab;
  page: number;
  limit: number;
  searchTerm?: string;
  status?: InvitationStatus;
  eventId?: string;
};

type InvitationsQuerySearchParams = {
  tab?: string | null;
  page?: string | null;
  limit?: string | null;
  searchTerm?: string | null;
  status?: string | null;
  eventId?: string | null;
};

type SearchParamsReader = {
  get(key: string): string | null;
};

function buildInvitationsHref(query: Partial<ResolvedInvitationsQuery>) {
  const searchParams = new URLSearchParams();

  if (query.tab && query.tab !== DEFAULT_INVITATIONS_TAB) {
    searchParams.set("tab", query.tab);
  }

  if (query.searchTerm?.trim()) {
    searchParams.set("searchTerm", query.searchTerm.trim());
  }

  if (
    query.status &&
    !(
      query.tab !== "sent" &&
      query.status === DEFAULT_RECEIVED_INVITATION_STATUS
    )
  ) {
    searchParams.set("status", query.status);
  }

  if (query.tab === "sent" && query.eventId?.trim()) {
    searchParams.set("eventId", query.eventId.trim());
  }

  if (query.page && query.page !== DEFAULT_INVITATIONS_PAGE) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit && query.limit !== DEFAULT_INVITATIONS_LIMIT) {
    searchParams.set("limit", String(query.limit));
  }

  const result = searchParams.toString();
  return result ? `/dashboard/invitations?${result}` : "/dashboard/invitations";
}

function resolveInvitationsQuery(
  searchParams: InvitationsQuerySearchParams
): ResolvedInvitationsQuery {
  const tab = normalizeEnum(
    searchParams.tab,
    INVITATIONS_TAB_VALUES,
    DEFAULT_INVITATIONS_TAB
  );

  return {
    tab,
    page: normalizePositiveInteger(searchParams.page, DEFAULT_INVITATIONS_PAGE),
    limit: normalizePositiveInteger(searchParams.limit, DEFAULT_INVITATIONS_LIMIT),
    searchTerm: normalizeSearchTerm(searchParams.searchTerm),
    status:
      tab === "received"
        ? normalizeEnum(
            searchParams.status,
            INVITATION_STATUS_VALUES,
            DEFAULT_RECEIVED_INVITATION_STATUS
          )
        : normalizeOptionalEnum(searchParams.status, INVITATION_STATUS_VALUES),
    eventId: tab === "sent" ? normalizeSearchTerm(searchParams.eventId) : undefined,
  };
}

function resolveInvitationsQueryFromSearchParams(searchParams: SearchParamsReader) {
  return resolveInvitationsQuery({
    tab: searchParams.get("tab"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    searchTerm: searchParams.get("searchTerm"),
    status: searchParams.get("status"),
    eventId: searchParams.get("eventId"),
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
  buildInvitationsHref,
  DEFAULT_INVITATIONS_LIMIT,
  DEFAULT_INVITATIONS_PAGE,
  DEFAULT_INVITATIONS_TAB,
  DEFAULT_RECEIVED_INVITATION_STATUS,
  resolveInvitationsQuery,
  resolveInvitationsQueryFromSearchParams,
};
export type { InvitationsTab, ResolvedInvitationsQuery };
