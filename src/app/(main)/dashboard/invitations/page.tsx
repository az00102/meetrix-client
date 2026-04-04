import { InvitationsPage } from "@/components/dashboard/invitations/invitations-page";
import { INVITATION_EVENT_FILTER_QUERY } from "@/components/dashboard/invitations/invitations.constants";
import {
  resolveInvitationsQuery,
  type ResolvedInvitationsQuery,
} from "@/lib/invitations-route";
import {
  getServerMyEvents,
  getServerMyInvitations,
  getServerSentInvitations,
} from "@/lib/server-dashboard-api";

type InvitationsPageSearchParams = Promise<{
  tab?: string | string[];
  page?: string | string[];
  limit?: string | string[];
  searchTerm?: string | string[];
  status?: string | string[];
  eventId?: string | string[];
}>;

export default async function DashboardInvitationsRoute({
  searchParams,
}: {
  searchParams: InvitationsPageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeInvitationsQuery(resolvedSearchParams);
  const [initialResult, initialEventFilterOptions] =
    query.tab === "sent"
      ? await Promise.all([
          getServerSentInvitations(query),
          getServerMyEvents(INVITATION_EVENT_FILTER_QUERY),
        ])
      : [await getServerMyInvitations(query), null];

  return (
    <InvitationsPage
      initialQuery={query}
      initialResult={initialResult}
      initialEventFilterOptions={initialEventFilterOptions}
    />
  );
}

function normalizeInvitationsQuery(
  searchParams: Awaited<InvitationsPageSearchParams>
): ResolvedInvitationsQuery {
  return resolveInvitationsQuery({
    tab: getFirstValue(searchParams.tab),
    page: getFirstValue(searchParams.page),
    limit: getFirstValue(searchParams.limit),
    searchTerm: getFirstValue(searchParams.searchTerm),
    status: getFirstValue(searchParams.status),
    eventId: getFirstValue(searchParams.eventId),
  });
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
