import { AuthApiError } from "@/lib/auth-api";
import type { ApiEnvelope } from "@/lib/api-contract";
import { isPaginationMeta } from "@/lib/api-contract";
import {
  buildAuthenticatedQueryString,
  requestAuthenticated,
  withRefreshOnUnauthorized,
} from "@/lib/authenticated-api";
import type {
  ApproveParticipantPayload,
  AuthenticatedListResult,
  BanParticipantPayload,
  ParticipationRecord,
  RejectParticipantPayload,
} from "@/lib/dashboard-contract";
import type { ResolvedParticipationsQuery } from "@/lib/participations-route";

async function getMyParticipations(
  query: ResolvedParticipationsQuery,
  signal?: AbortSignal
): Promise<AuthenticatedListResult<ParticipationRecord>> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<ParticipationRecord[]>(
        `/participations/my-participations${buildAuthenticatedQueryString(query)}`,
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
          : "Unable to load your participations right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function joinEvent(eventId: string) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<{
      action: "joined" | "requested";
      participation: ParticipationRecord;
    }>(`/participations/events/${eventId}/join`, {
      method: "POST",
    })
  );
}

async function approveParticipant(
  participantId: string,
  payload: ApproveParticipantPayload
) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<ParticipationRecord>(
      `/participations/${participantId}/approve`,
      {
        method: "PATCH",
        payload,
      }
    )
  );
}

async function rejectParticipant(
  participantId: string,
  payload: RejectParticipantPayload
) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<ParticipationRecord>(
      `/participations/${participantId}/reject`,
      {
        method: "PATCH",
        payload,
      }
    )
  );
}

async function banParticipant(participantId: string, payload: BanParticipantPayload) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<ParticipationRecord>(
      `/participations/${participantId}/ban`,
      {
        method: "PATCH",
        payload,
      }
    )
  );
}

export {
  approveParticipant,
  banParticipant,
  getMyParticipations,
  joinEvent,
  rejectParticipant,
};
export type { ApiEnvelope };
