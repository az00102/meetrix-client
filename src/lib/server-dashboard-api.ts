import "server-only";

import { isPaginationMeta, type PaginationMeta } from "@/lib/api-contract";
import { buildAuthenticatedQueryString } from "@/lib/authenticated-api";
import type {
  AuthenticatedItemResult,
  AuthenticatedListResult,
  EventParticipantsPayload,
  InvitationRecord,
  ManagedEvent,
  PaymentRecord,
  ParticipationRecord,
} from "@/lib/dashboard-contract";
import type { ResolvedInvitationsQuery } from "@/lib/invitations-route";
import {
  DEFAULT_MY_EVENTS_SORT_BY,
  DEFAULT_MY_EVENTS_SORT_ORDER,
} from "@/lib/my-events-route";
import type { ResolvedMyEventsQuery } from "@/lib/my-events-route";
import type { ResolvedPaymentsQuery } from "@/lib/payments-route";
import type { ResolvedParticipationsQuery } from "@/lib/participations-route";
import {
  DEFAULT_EVENT_PARTICIPANTS_LIMIT,
  DEFAULT_EVENT_PARTICIPANTS_PAGE,
  type EventParticipantsQuery,
} from "@/lib/managed-events-api";
import { requestServerAuthenticated } from "@/lib/server-authenticated-api";

type ServerItemWithMetaResult<T> = AuthenticatedItemResult<T> & {
  meta: PaginationMeta | null;
};

async function getServerMyParticipations(
  query: ResolvedParticipationsQuery
): Promise<AuthenticatedListResult<ParticipationRecord>> {
  const result = await requestServerAuthenticated<ParticipationRecord[]>(
    `/participations/my-participations${buildAuthenticatedQueryString(query)}`
  );

  return {
    data: result.data ?? [],
    meta: isPaginationMeta(result.meta) ? result.meta : null,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

async function getServerMyInvitations(
  query: ResolvedInvitationsQuery
): Promise<AuthenticatedListResult<InvitationRecord>> {
  const result = await requestServerAuthenticated<InvitationRecord[]>(
    `/invitations/my-invitations${buildAuthenticatedQueryString({
      page: query.page,
      limit: query.limit,
      searchTerm: query.searchTerm,
      status: query.status,
    })}`
  );

  return {
    data: result.data ?? [],
    meta: isPaginationMeta(result.meta) ? result.meta : null,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

async function getServerSentInvitations(
  query: ResolvedInvitationsQuery
): Promise<AuthenticatedListResult<InvitationRecord>> {
  const result = await requestServerAuthenticated<InvitationRecord[]>(
    `/invitations/sent${buildAuthenticatedQueryString({
      page: query.page,
      limit: query.limit,
      searchTerm: query.searchTerm,
      status: query.status,
      eventId: query.eventId,
    })}`
  );

  return {
    data: result.data ?? [],
    meta: isPaginationMeta(result.meta) ? result.meta : null,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

async function getServerMyEvents(
  query: ResolvedMyEventsQuery
): Promise<AuthenticatedListResult<ManagedEvent>> {
  const result = await requestServerAuthenticated<ManagedEvent[]>(
    `/events/my-events${buildAuthenticatedQueryString(query)}`
  );

  return {
    data: result.data ?? [],
    meta: isPaginationMeta(result.meta) ? result.meta : null,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

async function getServerMyPayments(
  query: ResolvedPaymentsQuery
): Promise<AuthenticatedListResult<PaymentRecord>> {
  const result = await requestServerAuthenticated<PaymentRecord[]>(
    `/payments/my-payments${buildAuthenticatedQueryString(query)}`
  );

  return {
    data: result.data ?? [],
    meta: isPaginationMeta(result.meta) ? result.meta : null,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

async function getServerEventParticipants(
  eventId: string,
  query: EventParticipantsQuery = {
    page: DEFAULT_EVENT_PARTICIPANTS_PAGE,
    limit: DEFAULT_EVENT_PARTICIPANTS_LIMIT,
  }
): Promise<ServerItemWithMetaResult<EventParticipantsPayload>> {
  const result = await requestServerAuthenticated<EventParticipantsPayload>(
    `/events/${eventId}/participants${buildAuthenticatedQueryString(query)}`
  );

  return {
    data: result.data,
    meta: isPaginationMeta(result.meta) ? result.meta : null,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

async function getServerManagedEventById(
  eventId: string
): Promise<AuthenticatedItemResult<ManagedEvent>> {
  const baseQuery: ResolvedMyEventsQuery = {
    page: 1,
    limit: 50,
    sortBy: DEFAULT_MY_EVENTS_SORT_BY,
    sortOrder: DEFAULT_MY_EVENTS_SORT_ORDER,
  };
  const firstPage = await getServerMyEvents(baseQuery);

  if (firstPage.errorMessage) {
    return {
      data: null,
      errorMessage: firstPage.errorMessage,
      errorStatus: firstPage.errorStatus,
    };
  }

  const matchedFromFirstPage = firstPage.data.find((event) => event.id === eventId);

  if (matchedFromFirstPage) {
    return {
      data: matchedFromFirstPage,
      errorMessage: null,
      errorStatus: null,
    };
  }

  const totalPages = firstPage.meta?.totalPages ?? 0;

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await getServerMyEvents({
      ...baseQuery,
      page,
    });

    if (result.errorMessage) {
      return {
        data: null,
        errorMessage: result.errorMessage,
        errorStatus: result.errorStatus,
      };
    }

    const matchedEvent = result.data.find((event) => event.id === eventId);

    if (matchedEvent) {
      return {
        data: matchedEvent,
        errorMessage: null,
        errorStatus: null,
      };
    }
  }

  return {
    data: null,
    errorMessage: "Event not found.",
    errorStatus: 404,
  };
}

async function getServerPaymentById(
  paymentId: string
): Promise<AuthenticatedItemResult<PaymentRecord>> {
  const result = await requestServerAuthenticated<PaymentRecord>(
    `/payments/${paymentId}`
  );

  return {
    data: result.data,
    errorMessage: result.errorMessage,
    errorStatus: result.errorStatus,
  };
}

export {
  getServerEventParticipants,
  getServerManagedEventById,
  getServerMyEvents,
  getServerMyInvitations,
  getServerMyPayments,
  getServerMyParticipations,
  getServerPaymentById,
  getServerSentInvitations,
};
