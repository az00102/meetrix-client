import { notFound } from "next/navigation";

import { MyEventDetailsPage } from "@/components/dashboard/my-event-details-page";
import {
  DEFAULT_EVENT_PARTICIPANTS_LIMIT,
  DEFAULT_EVENT_PARTICIPANTS_PAGE,
} from "@/lib/managed-events-api";
import { getServerEventParticipants, getServerManagedEventById, getServerSentInvitations } from "@/lib/server-dashboard-api";
import type { ResolvedInvitationsQuery } from "@/lib/invitations-route";

type EventWorkspacePageParams = Promise<{
  id: string;
}>;

type EventWorkspaceSearchParams = Promise<{
  section?: string | string[];
}>;

export default async function DashboardMyEventWorkspaceRoute({
  params,
  searchParams,
}: {
  params: EventWorkspacePageParams;
  searchParams: EventWorkspaceSearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialSection = normalizeSection(getFirstValue(resolvedSearchParams.section));
  const initialSentInvitationsQuery: ResolvedInvitationsQuery = {
    tab: "sent",
    page: 1,
    limit: 10,
    eventId: id,
  };
  const participantsPromise =
    initialSection === "participants"
      ? getServerEventParticipants(id, {
          page: DEFAULT_EVENT_PARTICIPANTS_PAGE,
          limit: DEFAULT_EVENT_PARTICIPANTS_LIMIT,
        })
      : Promise.resolve({
          data: null,
          meta: null,
          errorMessage: null,
          errorStatus: null,
        });
  const sentInvitationsPromise =
    initialSection === "invitations"
      ? getServerSentInvitations(initialSentInvitationsQuery)
      : Promise.resolve({
          data: [],
          meta: null,
          errorMessage: null,
          errorStatus: null,
        });
  const [eventResult, initialParticipantsResult, initialSentInvitationsResult] =
    await Promise.all([
      getServerManagedEventById(id),
      participantsPromise,
      sentInvitationsPromise,
    ]);

  if (eventResult.errorStatus === 404) {
    notFound();
  }

  return (
    <MyEventDetailsPage
      eventResult={eventResult}
      initialSection={initialSection}
      initialParticipantsResult={initialParticipantsResult}
      initialSentInvitationsResult={initialSentInvitationsResult}
    />
  );
}

function normalizeSection(value: string | undefined) {
  if (value === "participants" || value === "invitations") {
    return value;
  }

  return "overview";
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
