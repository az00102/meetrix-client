import { AuthApiError } from "@/lib/auth-api";
import type { ApiEnvelope } from "@/lib/api-contract";
import { isPaginationMeta } from "@/lib/api-contract";
import {
  buildAuthenticatedQueryString,
  requestAuthenticated,
  withRefreshOnUnauthorized,
} from "@/lib/authenticated-api";
import type {
  AuthenticatedListResult,
  CreateInvitationPayload,
  InvitationRecord,
} from "@/lib/dashboard-contract";
import type { ResolvedInvitationsQuery } from "@/lib/invitations-route";

async function getMyInvitations(
  query: ResolvedInvitationsQuery,
  signal?: AbortSignal
): Promise<AuthenticatedListResult<InvitationRecord>> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<InvitationRecord[]>(
        `/invitations/my-invitations${buildAuthenticatedQueryString({
          page: query.page,
          limit: query.limit,
          searchTerm: query.searchTerm,
          status: query.status,
        })}`,
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
          : "Unable to load your invitations right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function getSentInvitations(
  query: ResolvedInvitationsQuery,
  signal?: AbortSignal
): Promise<AuthenticatedListResult<InvitationRecord>> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<InvitationRecord[]>(
        `/invitations/sent${buildAuthenticatedQueryString({
          page: query.page,
          limit: query.limit,
          searchTerm: query.searchTerm,
          status: query.status,
          eventId: query.eventId,
        })}`,
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
          : "Unable to load your sent invitations right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function createInvitation(payload: CreateInvitationPayload) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<InvitationRecord>("/invitations", {
      method: "POST",
      payload,
    })
  );
}

async function acceptInvitation(invitationId: string) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<InvitationRecord>(`/invitations/${invitationId}/accept`, {
      method: "PATCH",
    })
  );
}

async function declineInvitation(invitationId: string) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<InvitationRecord>(`/invitations/${invitationId}/decline`, {
      method: "PATCH",
    })
  );
}

async function cancelInvitation(invitationId: string) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<InvitationRecord>(`/invitations/${invitationId}/cancel`, {
      method: "PATCH",
    })
  );
}

export {
  acceptInvitation,
  cancelInvitation,
  createInvitation,
  declineInvitation,
  getMyInvitations,
  getSentInvitations,
};
export type { ApiEnvelope };
