import { AuthApiError } from "@/lib/auth-api";
import { isPaginationMeta, type PaginationMeta } from "@/lib/api-contract";
import {
  buildAuthenticatedQueryString,
  requestAuthenticated,
  withRefreshOnUnauthorized,
} from "@/lib/authenticated-api";
import type {
  AuthenticatedItemResult,
  AuthenticatedListResult,
  CreateManagedEventPayload,
  DeletedManagedEventSummary,
  EventParticipantsPayload,
  ManagedEvent,
  ParticipantStatus,
  UpdateManagedEventPayload,
} from "@/lib/dashboard-contract";
import type { ResolvedMyEventsQuery } from "@/lib/my-events-route";

const DEFAULT_EVENT_PARTICIPANTS_PAGE = 1;
const DEFAULT_EVENT_PARTICIPANTS_LIMIT = 10;

type EventParticipantsQuery = {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: ParticipantStatus;
};

type EventParticipantsResult = AuthenticatedItemResult<EventParticipantsPayload> & {
  meta: PaginationMeta | null;
};

async function getMyEvents(
  query: ResolvedMyEventsQuery,
  signal?: AbortSignal
): Promise<AuthenticatedListResult<ManagedEvent>> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<ManagedEvent[]>(
        `/events/my-events${buildAuthenticatedQueryString(query)}`,
        { signal }
      )
    );

    return {
      data: result.data,
      meta: isPaginationMeta(result.meta) ? result.meta : null,
      errorMessage: null,
      errorStatus: null,
    };
  } catch (error) {
    return {
      data: [],
      meta: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unable to load your hosted events right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function getEventParticipants(
  eventId: string,
  query: EventParticipantsQuery,
  signal?: AbortSignal
): Promise<EventParticipantsResult> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<EventParticipantsPayload>(
        `/events/${eventId}/participants${buildAuthenticatedQueryString(query)}`,
        { signal }
      )
    );

    return {
      data: result.data,
      meta: isPaginationMeta(result.meta) ? result.meta : null,
      errorMessage: null,
      errorStatus: null,
    };
  } catch (error) {
    return {
      data: null,
      meta: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unable to load event participants right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function createManagedEvent(payload: CreateManagedEventPayload) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<ManagedEvent>("/events", {
      method: "POST",
      payload,
    })
  );
}

async function updateManagedEvent(
  eventId: string,
  payload: UpdateManagedEventPayload
) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<ManagedEvent>(`/events/${eventId}`, {
      method: "PATCH",
      payload,
    })
  );
}

async function deleteManagedEvent(eventId: string) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<DeletedManagedEventSummary>(`/events/${eventId}`, {
      method: "DELETE",
    })
  );
}

export {
  createManagedEvent,
  DEFAULT_EVENT_PARTICIPANTS_LIMIT,
  DEFAULT_EVENT_PARTICIPANTS_PAGE,
  deleteManagedEvent,
  getEventParticipants,
  getMyEvents,
  updateManagedEvent,
};
export type { EventParticipantsQuery, EventParticipantsResult };
