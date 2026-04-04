"use client";

import * as React from "react";
import Link from "next/link";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import {
  DashboardBadge,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardFilterSelect,
  DashboardPagination,
  DashboardSearchInput,
  DashboardTableSurface,
  DashboardTableToolbar,
} from "@/components/dashboard/dashboard-ui";
import { DashboardListPageSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AuthenticatedListResult,
  InvitationRecord,
  ManagedEvent,
} from "@/lib/dashboard-contract";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import {
  formatDashboardDateTime,
  formatDashboardEnum,
  formatDashboardPricing,
} from "@/lib/dashboard-display";
import {
  acceptInvitation,
  cancelInvitation,
  declineInvitation,
  getMyInvitations,
  getSentInvitations,
} from "@/lib/invitation-api";
import {
  buildInvitationsHref,
  DEFAULT_RECEIVED_INVITATION_STATUS,
  DEFAULT_INVITATIONS_PAGE,
  type InvitationsTab,
  type ResolvedInvitationsQuery,
  resolveInvitationsQueryFromSearchParams,
} from "@/lib/invitations-route";
import { getMyEvents } from "@/lib/managed-events-api";
import { initiatePayment } from "@/lib/payment-api";
import { INVITATION_EVENT_FILTER_QUERY } from "./invitations.constants";

const RECEIVED_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const SENT_STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const EMPTY_INVITATIONS_RESULT = {
  data: [],
  meta: null,
  errorMessage: null,
  errorStatus: null,
} satisfies AuthenticatedListResult<InvitationRecord>;

const EMPTY_EVENT_FILTER_OPTIONS = {
  data: [],
  meta: null,
  errorMessage: null,
  errorStatus: null,
} satisfies AuthenticatedListResult<ManagedEvent>;

function InvitationsWorkspace({
  initialQuery,
  initialResult,
  initialEventFilterOptions,
}: {
  initialQuery: ResolvedInvitationsQuery;
  initialResult: AuthenticatedListResult<InvitationRecord>;
  initialEventFilterOptions: AuthenticatedListResult<ManagedEvent> | null;
}) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeQuery = resolveInvitationsQueryFromSearchParams(searchParams);
  const [searchTerm, setSearchTerm] = React.useState(initialQuery.searchTerm ?? "");
  const [feedback, setFeedback] = React.useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    setSearchTerm(activeQuery.searchTerm ?? "");
  }, [activeQuery.searchTerm]);

  function updateQuery(nextQuery: ResolvedInvitationsQuery) {
    const nextHref = buildInvitationsHref(nextQuery);
    const activeHref = buildInvitationsHref(activeQuery);

    if (nextHref === activeHref) {
      return;
    }

    window.history.pushState(null, "", nextHref);
  }

  const commitSearch = React.useEffectEvent((nextSearchTerm: string) => {
    updateQuery({
      ...activeQuery,
      page: DEFAULT_INVITATIONS_PAGE,
      searchTerm: nextSearchTerm || undefined,
    });
  });

  React.useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim();

    if (normalizedSearchTerm === (activeQuery.searchTerm ?? "")) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      commitSearch(normalizedSearchTerm);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [activeQuery.searchTerm, searchTerm]);

  const receivedInvitationsQuery = useQuery({
    queryKey: dashboardQueryKeys.myInvitations(activeQuery),
    queryFn: ({ signal }) => getMyInvitations(activeQuery, signal),
    enabled: activeQuery.tab === "received",
    placeholderData: keepPreviousData,
    initialData:
      initialQuery.tab === "received" &&
      buildInvitationsHref(activeQuery) === buildInvitationsHref(initialQuery)
        ? initialResult
        : undefined,
  });

  const sentInvitationsQuery = useQuery({
    queryKey: dashboardQueryKeys.sentInvitations(activeQuery),
    queryFn: ({ signal }) => getSentInvitations(activeQuery, signal),
    enabled: activeQuery.tab === "sent",
    placeholderData: keepPreviousData,
    initialData:
      initialQuery.tab === "sent" &&
      buildInvitationsHref(activeQuery) === buildInvitationsHref(initialQuery)
        ? initialResult
        : undefined,
  });

  const eventFilterOptionsQuery = useQuery({
    queryKey: dashboardQueryKeys.myEvents(INVITATION_EVENT_FILTER_QUERY),
    queryFn: ({ signal }) => getMyEvents(INVITATION_EVENT_FILTER_QUERY, signal),
    enabled: activeQuery.tab === "sent",
    placeholderData: keepPreviousData,
    initialData:
      initialQuery.tab === "sent"
        ? initialEventFilterOptions ?? EMPTY_EVENT_FILTER_OPTIONS
        : undefined,
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (result) => {
      setFeedback({ tone: "success", message: result.message });
      void queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      void queryClient.invalidateQueries({ queryKey: ["my-participations"] });
    },
    onError: (error) => {
      setFeedback({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to accept this invitation right now.",
      });
    },
  });

  const declineInvitationMutation = useMutation({
    mutationFn: declineInvitation,
    onSuccess: (result) => {
      setFeedback({ tone: "success", message: result.message });
      void queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      void queryClient.invalidateQueries({ queryKey: ["my-participations"] });
    },
    onError: (error) => {
      setFeedback({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to decline this invitation right now.",
      });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: (result) => {
      setFeedback({ tone: "success", message: result.message });
      void queryClient.invalidateQueries({ queryKey: ["sent-invitations"] });
    },
    onError: (error) => {
      setFeedback({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to cancel this invitation right now.",
      });
    },
  });

  const payInvitationMutation = useMutation({
    mutationFn: (invitationId: string) =>
      initiatePayment({
        purpose: "INVITATION_ACCEPTANCE",
        invitationId,
      }),
    onSuccess: (result) => {
      if (result.data.redirectUrl) {
        window.location.assign(result.data.redirectUrl);
        return;
      }

      setFeedback({
        tone: "danger",
        message: "The payment session could not be started right now.",
      });
    },
    onError: (error) => {
      setFeedback({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to start the payment flow right now.",
      });
    },
  });

  const activeResult =
    activeQuery.tab === "received"
      ? receivedInvitationsQuery.data
      : sentInvitationsQuery.data;
  const isPending =
    activeQuery.tab === "received"
      ? receivedInvitationsQuery.isFetching
      : sentInvitationsQuery.isFetching;
  const currentResult = activeResult ?? EMPTY_INVITATIONS_RESULT;
  const isInitialLoading =
    activeQuery.tab === "received"
      ? receivedInvitationsQuery.isLoading && !receivedInvitationsQuery.data
      : sentInvitationsQuery.isLoading && !sentInvitationsQuery.data;
  const hasStatusFilter =
    activeQuery.tab === "sent"
      ? Boolean(activeQuery.status)
      : activeQuery.status !== DEFAULT_RECEIVED_INVITATION_STATUS;
  const hasFilters = Boolean(
    activeQuery.searchTerm ||
      hasStatusFilter ||
      (activeQuery.tab === "sent" && activeQuery.eventId)
  );

  function changeTab(tab: InvitationsTab) {
    updateQuery({
      tab,
      page: DEFAULT_INVITATIONS_PAGE,
      limit: activeQuery.limit,
      searchTerm: activeQuery.searchTerm,
      status: tab === "received" ? "PENDING" : activeQuery.status,
      eventId: tab === "sent" ? activeQuery.eventId : undefined,
    });
  }

  function resetFilters() {
    setSearchTerm("");
    updateQuery({
      tab: activeQuery.tab,
      page: DEFAULT_INVITATIONS_PAGE,
      limit: activeQuery.limit,
      searchTerm: undefined,
      status: activeQuery.tab === "received" ? "PENDING" : undefined,
      eventId: undefined,
    });
  }

  if (isInitialLoading) {
    return (
      <DashboardListPageSkeleton
        filterCount={activeQuery.tab === "sent" ? 2 : 1}
        columnCount={5}
      />
    );
  }

  if (currentResult.errorStatus === 401) {
    return (
      <DashboardErrorState
        title="Sign in to manage invitations"
        description={
          currentResult.errorMessage ??
          "Your session is no longer active. Log in again to continue."
        }
      />
    );
  }

  return (
    <>
      {feedback ? (
        <p
          className={
            feedback.tone === "success"
              ? "rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
              : "rounded-[1.5rem] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {feedback.message}
        </p>
      ) : null}

      <DashboardTableToolbar
        header={
          <div className="inline-flex flex-wrap rounded-2xl border border-border bg-muted/40 p-1">
            <TabButton
              active={activeQuery.tab === "received"}
              onClick={() => changeTab("received")}
            >
              Received
            </TabButton>
            <TabButton
              active={activeQuery.tab === "sent"}
              onClick={() => changeTab("sent")}
            >
              Sent
            </TabButton>
          </div>
        }
        controls={
          <div
            className={
              activeQuery.tab === "sent"
                ? "grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_repeat(2,minmax(10rem,0.8fr))]"
                : "grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(10rem,0.8fr)]"
            }
          >
            <DashboardSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={
                activeQuery.tab === "received"
                  ? "Search by event or inviter"
                  : "Search by event or invitee"
              }
              disabled={isPending}
            />
            <DashboardFilterSelect
              label="Status"
              value={activeQuery.status ?? ""}
              disabled={isPending}
              options={
                activeQuery.tab === "received"
                  ? RECEIVED_STATUS_OPTIONS
                  : SENT_STATUS_OPTIONS
              }
              onChange={(value) =>
                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_INVITATIONS_PAGE,
                  status: (value || undefined) as ResolvedInvitationsQuery["status"],
                })
              }
            />
            {activeQuery.tab === "sent" ? (
              <DashboardFilterSelect
                label="Event"
                value={activeQuery.eventId ?? ""}
                disabled={isPending || eventFilterOptionsQuery.isFetching}
                options={[
                  { label: "All events", value: "" },
                  ...(eventFilterOptionsQuery.data?.data ?? []).map((event) => ({
                    label: event.title,
                    value: event.id,
                  })),
                ]}
                onChange={(value) =>
                  updateQuery({
                    ...activeQuery,
                    page: DEFAULT_INVITATIONS_PAGE,
                    eventId: value || undefined,
                  })
                }
              />
            ) : null}
          </div>
        }
        summary={
          <>
            <p className="font-medium text-foreground">
              {currentResult.meta?.total ?? currentResult.data.length}{" "}
              {activeQuery.tab === "received" ? "received" : "sent"} invitation
              {(currentResult.meta?.total ?? currentResult.data.length) === 1
                ? ""
                : "s"}
            </p>
            {currentResult.meta ? (
              <p className="text-muted-foreground">
                Page {currentResult.meta.page} of {currentResult.meta.totalPages}
              </p>
            ) : null}
            {isPending ? <p className="text-muted-foreground">Refreshing...</p> : null}
          </>
        }
        actions={
          hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={isPending}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      {currentResult.errorMessage ? (
        <DashboardErrorState
          title={`We couldn't load your ${activeQuery.tab} invitations`}
          description={currentResult.errorMessage}
          onRetry={() =>
            void (
              activeQuery.tab === "received"
                ? receivedInvitationsQuery.refetch()
                : sentInvitationsQuery.refetch()
            )
          }
        />
      ) : currentResult.data.length === 0 ? (
        <DashboardEmptyState
          title={
            hasFilters
              ? "No invitations matched this view."
              : activeQuery.tab === "received"
                ? "No received invitations right now."
                : "No sent invitations yet."
          }
          description={
            hasFilters
              ? "Try a broader search or clear the active filters to see more results."
              : activeQuery.tab === "received"
                ? "As soon as someone invites you to an event, it will show up here."
                : "Send invitations from one of your hosted events and track them here."
          }
          action={
            hasFilters ? (
              <Button type="button" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DashboardTableSurface>
          <Table className="min-w-[980px]">
            <TableHeader className="bg-muted/25">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-4">Event</TableHead>
                <TableHead className="px-5 py-4">
                  {activeQuery.tab === "received" ? "Invited By" : "Invitee"}
                </TableHead>
                <TableHead className="px-5 py-4">Date</TableHead>
                <TableHead className="px-5 py-4">Status</TableHead>
                <TableHead className="px-5 py-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResult.data.map((invitation) => (
                <InvitationTableRow
                  key={invitation.id}
                  invitation={invitation}
                  tab={activeQuery.tab}
                  isAccepting={acceptInvitationMutation.variables === invitation.id}
                  isDeclining={declineInvitationMutation.variables === invitation.id}
                  isCancelling={cancelInvitationMutation.variables === invitation.id}
                  isPaying={payInvitationMutation.variables === invitation.id}
                  onAccept={() => acceptInvitationMutation.mutate(invitation.id)}
                  onDecline={() => declineInvitationMutation.mutate(invitation.id)}
                  onCancel={() => cancelInvitationMutation.mutate(invitation.id)}
                  onPay={() => payInvitationMutation.mutate(invitation.id)}
                />
              ))}
            </TableBody>
          </Table>
        </DashboardTableSurface>
      )}

      {currentResult.meta ? (
        <DashboardPagination
          meta={currentResult.meta}
          isPending={isPending}
          onPageChange={(page) =>
            updateQuery({
              ...activeQuery,
              page,
            })
          }
        />
      ) : null}
    </>
  );
}

const InvitationTableRow = React.memo(function InvitationTableRow({
  invitation,
  tab,
  isAccepting,
  isDeclining,
  isCancelling,
  isPaying,
  onAccept,
  onDecline,
  onCancel,
  onPay,
}: {
  invitation: InvitationRecord;
  tab: InvitationsTab;
  isAccepting: boolean;
  isDeclining: boolean;
  isCancelling: boolean;
  isPaying: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onPay: () => void;
}) {
  const counterparty =
    tab === "received"
      ? invitation.invitedBy.name
      : invitation.invitee.name || invitation.invitee.email;
  const canPayReceivedInvitation =
    tab === "received" &&
    invitation.status === "PENDING" &&
    invitation.event.requiresPayment &&
    invitation.paymentStatus !== "PAID";
  const canDeclineReceivedInvitation =
    tab === "received" &&
    invitation.status === "PENDING" &&
    (!invitation.event.requiresPayment || invitation.paymentStatus !== "PAID");

  return (
    <TableRow>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[16rem] flex-col gap-2">
          <p className="font-semibold text-foreground">{invitation.event.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatDashboardPricing(invitation.event)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[12rem] flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{counterparty}</span>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <span className="inline-block min-w-[12rem] text-sm font-medium text-foreground">
          {formatDashboardDateTime(invitation.event.startsAt)}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[12rem] flex-col gap-2">
          <DashboardBadge tone={getCombinedInvitationTone(invitation)}>
            {formatCombinedInvitationStatus(invitation)}
          </DashboardBadge>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/events/${invitation.event.slug}`}>View</Link>
          </Button>

          {tab === "received" && invitation.status === "PENDING" ? (
            <>
              {invitation.event.requiresPayment ? (
                canPayReceivedInvitation ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={onPay}
                    disabled={isPaying || isDeclining}
                  >
                    {isPaying ? "Redirecting..." : "Pay & accept"}
                  </Button>
                ) : null
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={onAccept}
                  disabled={isAccepting || isDeclining}
                >
                  {isAccepting ? "Accepting..." : "Accept"}
                </Button>
              )}
              {canDeclineReceivedInvitation ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onDecline}
                  disabled={isAccepting || isDeclining || isPaying}
                >
                  {isDeclining ? "Declining..." : "Decline"}
                </Button>
              ) : null}
            </>
          ) : null}

          {tab === "sent" && invitation.status === "PENDING" ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
});

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant={active ? "secondary" : "ghost"} onClick={onClick}>
      {children}
    </Button>
  );
}

function getCombinedInvitationTone(invitation: InvitationRecord) {
  const invitationTone = getInvitationTone(invitation.status);
  const paymentTone = getPaymentTone(invitation.paymentStatus);

  if (invitationTone === "danger" || paymentTone === "danger") {
    return "danger";
  }

  if (invitationTone === "warning" || paymentTone === "warning") {
    return "warning";
  }

  if (invitationTone === "success" && paymentTone === "success") {
    return "success";
  }

  if (invitationTone === "success") {
    return "success";
  }

  return "default";
}

function formatCombinedInvitationStatus(invitation: InvitationRecord) {
  return `${formatDashboardEnum(invitation.status)} / ${formatDashboardEnum(invitation.paymentStatus)}`;
}

function getInvitationTone(status: InvitationRecord["status"]) {
  if (status === "ACCEPTED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  if (status === "DECLINED" || status === "CANCELLED" || status === "EXPIRED") {
    return "danger";
  }

  return "default";
}

function getPaymentTone(status: InvitationRecord["paymentStatus"]) {
  if (status === "PAID") {
    return "success";
  }

  if (status === "PENDING" || status === "UNPAID") {
    return "warning";
  }

  if (status === "FAILED" || status === "CANCELLED" || status === "REFUNDED") {
    return "danger";
  }

  return "default";
}

export { InvitationsWorkspace };
