"use client";

import * as React from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  ParticipationRecord,
} from "@/lib/dashboard-contract";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import {
  formatDashboardEnum,
  formatDashboardPricing,
} from "@/lib/dashboard-display";
import { getMyParticipations } from "@/lib/participation-api";
import {
  buildParticipationsHref,
  DEFAULT_PARTICIPATIONS_PAGE,
  type ResolvedParticipationsQuery,
  resolveParticipationsQueryFromSearchParams,
} from "@/lib/participations-route";

const PARTICIPATION_STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Banned", value: "BANNED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const SORT_OPTIONS = [
  { label: "Recently updated", value: "updatedAt-desc" },
  { label: "Latest created", value: "createdAt-desc" },
  { label: "Newest joined", value: "joinedAt-desc" },
  { label: "Event start soonest", value: "startsAt-asc" },
  { label: "Event start latest", value: "startsAt-desc" },
] as const;

const EMPTY_PARTICIPATIONS_RESULT = {
  data: [],
  meta: null,
  errorMessage: null,
  errorStatus: null,
} satisfies AuthenticatedListResult<ParticipationRecord>;

function ParticipationsWorkspace({
  initialQuery,
  initialResult,
}: {
  initialQuery: ResolvedParticipationsQuery;
  initialResult: AuthenticatedListResult<ParticipationRecord>;
}) {
  const searchParams = useSearchParams();
  const activeQuery = resolveParticipationsQueryFromSearchParams(searchParams);
  const [searchTerm, setSearchTerm] = React.useState(initialQuery.searchTerm ?? "");

  React.useEffect(() => {
    setSearchTerm(activeQuery.searchTerm ?? "");
  }, [activeQuery.searchTerm]);

  function updateQuery(nextQuery: ResolvedParticipationsQuery) {
    const nextHref = buildParticipationsHref(nextQuery);
    const activeHref = buildParticipationsHref(activeQuery);

    if (nextHref === activeHref) {
      return;
    }

    window.history.pushState(null, "", nextHref);
  }

  const commitSearch = React.useEffectEvent((nextSearchTerm: string) => {
    updateQuery({
      ...activeQuery,
      page: DEFAULT_PARTICIPATIONS_PAGE,
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

  const participationsQuery = useQuery({
    queryKey: dashboardQueryKeys.myParticipations(activeQuery),
    queryFn: ({ signal }) => getMyParticipations(activeQuery, signal),
    placeholderData: keepPreviousData,
    initialData:
      buildParticipationsHref(activeQuery) === buildParticipationsHref(initialQuery)
        ? initialResult
        : undefined,
  });

  const result = participationsQuery.data ?? EMPTY_PARTICIPATIONS_RESULT;
  const isInitialLoading =
    participationsQuery.isLoading && !participationsQuery.data;
  const hasFilters = Boolean(activeQuery.searchTerm || activeQuery.status);
  const selectedSortValue = `${activeQuery.sortBy}-${activeQuery.sortOrder}`;

  function resetFilters() {
    setSearchTerm("");
    updateQuery({
      ...activeQuery,
      page: DEFAULT_PARTICIPATIONS_PAGE,
      searchTerm: undefined,
      status: undefined,
    });
  }

  if (isInitialLoading) {
    return <DashboardListPageSkeleton filterCount={2} columnCount={6} />;
  }

  if (result.errorStatus === 401) {
    return (
      <DashboardErrorState
        title="Sign in to view your participations"
        description={
          result.errorMessage ??
          "Your session is no longer active. Log in again to continue."
        }
      />
    );
  }

  return (
    <>
      <DashboardTableToolbar
        controls={
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(2,minmax(10rem,0.85fr))]">
            <DashboardSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by event or organizer"
              disabled={participationsQuery.isFetching}
            />
            <DashboardFilterSelect
              label="Status"
              value={activeQuery.status ?? ""}
              disabled={participationsQuery.isFetching}
              options={PARTICIPATION_STATUS_OPTIONS}
              onChange={(value) =>
                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_PARTICIPATIONS_PAGE,
                  status: (value || undefined) as ResolvedParticipationsQuery["status"],
                })
              }
            />
            <DashboardFilterSelect
              label="Sort"
              value={selectedSortValue}
              disabled={participationsQuery.isFetching}
              options={SORT_OPTIONS}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");

                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_PARTICIPATIONS_PAGE,
                  sortBy: sortBy as ResolvedParticipationsQuery["sortBy"],
                  sortOrder: sortOrder as ResolvedParticipationsQuery["sortOrder"],
                });
              }}
            />
          </div>
        }
        summary={
          <>
            <p className="font-medium text-foreground">
              {result.meta?.total ?? result.data.length} participation
              {(result.meta?.total ?? result.data.length) === 1 ? "" : "s"}
            </p>
            {result.meta ? (
              <p className="text-muted-foreground">
                Page {result.meta.page} of {result.meta.totalPages}
              </p>
            ) : null}
            {participationsQuery.isFetching ? (
              <p className="text-muted-foreground">Refreshing...</p>
            ) : null}
          </>
        }
        actions={
          hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={participationsQuery.isFetching}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      {result.errorMessage ? (
        <DashboardErrorState
          title="We couldn't load your participations"
          description={result.errorMessage}
          onRetry={() => void participationsQuery.refetch()}
        />
      ) : result.data.length === 0 ? (
        <DashboardEmptyState
          title={hasFilters ? "No participations matched this view." : "No participations yet."}
          description={
            hasFilters
              ? "Try a broader search or clear the active filters to see more results."
              : "Join an event and it will show up here with its approval and payment state."
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
          <Table className="min-w-[1040px]">
            <TableHeader className="bg-muted/25">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-4">Event</TableHead>
                <TableHead className="px-5 py-4">Organizer</TableHead>
                <TableHead className="px-5 py-4">Payment status</TableHead>
                <TableHead className="px-5 py-4">Invite status</TableHead>
                <TableHead className="px-5 py-4">Participation status</TableHead>
                <TableHead className="px-5 py-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((participation) => (
                <ParticipationTableRow
                  key={participation.id}
                  participation={participation}
                />
              ))}
            </TableBody>
          </Table>
        </DashboardTableSurface>
      )}

      {result.meta ? (
        <DashboardPagination
          meta={result.meta}
          isPending={participationsQuery.isFetching}
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

const ParticipationTableRow = React.memo(function ParticipationTableRow({
  participation,
}: {
  participation: ParticipationRecord;
}) {
  return (
    <TableRow>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[16rem] flex-col gap-2">
          <p className="font-semibold text-foreground">{participation.event.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatDashboardPricing(participation.event)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <span className="inline-block min-w-[12rem] text-sm font-medium text-foreground">
          {participation.event.owner.name}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <DashboardBadge tone={getPaymentTone(participation.paymentStatus)}>
          {formatDashboardEnum(participation.paymentStatus)}
        </DashboardBadge>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <DashboardBadge tone={getInviteTone(participation.joinType)}>
          {formatInviteStatus(participation.joinType)}
        </DashboardBadge>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <DashboardBadge tone={getParticipantTone(participation.status)}>
          {formatDashboardEnum(participation.status)}
        </DashboardBadge>
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <Button asChild size="sm" variant="outline">
          <Link href={`/events/${participation.event.slug}`}>View event</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
});

function getParticipantTone(status: ParticipationRecord["status"]) {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  if (status === "REJECTED" || status === "BANNED" || status === "CANCELLED") {
    return "danger";
  }

  return "default";
}

function getPaymentTone(status: ParticipationRecord["paymentStatus"]) {
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

function getInviteTone(joinType: ParticipationRecord["joinType"]) {
  if (joinType === "INVITED") {
    return "success";
  }

  return "default";
}

function formatInviteStatus(joinType: ParticipationRecord["joinType"]) {
  if (joinType === "INVITED") {
    return "Accepted invite";
  }

  return "No invite";
}

export { ParticipationsWorkspace };
