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
  ManagedEvent,
} from "@/lib/dashboard-contract";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import {
  formatDashboardDateTime,
  formatDashboardEnum,
} from "@/lib/dashboard-display";
import { getMyEvents } from "@/lib/managed-events-api";
import {
  buildMyEventsHref,
  DEFAULT_MY_EVENTS_PAGE,
  type ResolvedMyEventsQuery,
  resolveMyEventsQueryFromSearchParams,
} from "@/lib/my-events-route";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
] as const;

const VISIBILITY_OPTIONS = [
  { label: "All visibility", value: "" },
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
] as const;

const SORT_OPTIONS = [
  { label: "Recently updated", value: "updatedAt-desc" },
  { label: "Soonest start", value: "startsAt-asc" },
  { label: "Latest created", value: "createdAt-desc" },
  { label: "Title A-Z", value: "title-asc" },
] as const;

const EMPTY_MY_EVENTS_RESULT = {
  data: [],
  meta: null,
  errorMessage: null,
  errorStatus: null,
} satisfies AuthenticatedListResult<ManagedEvent>;

function MyEventsWorkspace({
  initialQuery,
  initialResult,
}: {
  initialQuery: ResolvedMyEventsQuery;
  initialResult: AuthenticatedListResult<ManagedEvent>;
}) {
  const searchParams = useSearchParams();
  const activeQuery = resolveMyEventsQueryFromSearchParams(searchParams);
  const [searchTerm, setSearchTerm] = React.useState(initialQuery.searchTerm ?? "");

  React.useEffect(() => {
    setSearchTerm(activeQuery.searchTerm ?? "");
  }, [activeQuery.searchTerm]);

  function updateQuery(nextQuery: ResolvedMyEventsQuery) {
    const nextHref = buildMyEventsHref(nextQuery);
    const activeHref = buildMyEventsHref(activeQuery);

    if (nextHref === activeHref) {
      return;
    }

    window.history.pushState(null, "", nextHref);
  }

  const commitSearch = React.useEffectEvent((nextSearchTerm: string) => {
    updateQuery({
      ...activeQuery,
      page: DEFAULT_MY_EVENTS_PAGE,
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

  const myEventsQuery = useQuery({
    queryKey: dashboardQueryKeys.myEvents(activeQuery),
    queryFn: ({ signal }) => getMyEvents(activeQuery, signal),
    placeholderData: keepPreviousData,
    initialData:
      buildMyEventsHref(activeQuery) === buildMyEventsHref(initialQuery)
        ? initialResult
        : undefined,
  });

  const result = myEventsQuery.data ?? EMPTY_MY_EVENTS_RESULT;
  const isInitialLoading = myEventsQuery.isLoading && !myEventsQuery.data;
  const hasFilters = Boolean(
    activeQuery.searchTerm || activeQuery.status || activeQuery.visibility
  );
  const selectedSortValue = `${activeQuery.sortBy}-${activeQuery.sortOrder}`;

  function resetFilters() {
    setSearchTerm("");
    updateQuery({
      ...activeQuery,
      page: DEFAULT_MY_EVENTS_PAGE,
      searchTerm: undefined,
      status: undefined,
      visibility: undefined,
    });
  }

  if (isInitialLoading) {
    return <DashboardListPageSkeleton columnCount={5} />;
  }

  if (result.errorStatus === 401) {
    return (
      <DashboardErrorState
        title="Sign in to manage your events"
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(10rem,0.85fr))]">
            <DashboardSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by title or summary"
              disabled={myEventsQuery.isFetching}
            />
            <DashboardFilterSelect
              label="Status"
              value={activeQuery.status ?? ""}
              disabled={myEventsQuery.isFetching}
              options={STATUS_OPTIONS}
              onChange={(value) =>
                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_MY_EVENTS_PAGE,
                  status: (value || undefined) as ResolvedMyEventsQuery["status"],
                })
              }
            />
            <DashboardFilterSelect
              label="Visibility"
              value={activeQuery.visibility ?? ""}
              disabled={myEventsQuery.isFetching}
              options={VISIBILITY_OPTIONS}
              onChange={(value) =>
                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_MY_EVENTS_PAGE,
                  visibility: (value || undefined) as ResolvedMyEventsQuery["visibility"],
                })
              }
            />
            <DashboardFilterSelect
              label="Sort"
              value={selectedSortValue}
              disabled={myEventsQuery.isFetching}
              options={SORT_OPTIONS}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");

                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_MY_EVENTS_PAGE,
                  sortBy: sortBy as ResolvedMyEventsQuery["sortBy"],
                  sortOrder: sortOrder as ResolvedMyEventsQuery["sortOrder"],
                });
              }}
            />
          </div>
        }
        summary={
          <>
            <p className="font-medium text-foreground">
              {result.meta?.total ?? result.data.length} event
              {(result.meta?.total ?? result.data.length) === 1 ? "" : "s"}
            </p>
            {result.meta ? (
              <p className="text-muted-foreground">
                Page {result.meta.page} of {result.meta.totalPages}
              </p>
            ) : null}
            {myEventsQuery.isFetching ? (
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
              disabled={myEventsQuery.isFetching}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      {result.errorMessage ? (
        <DashboardErrorState
          title="We couldn't load your hosted events"
          description={result.errorMessage}
          onRetry={() => void myEventsQuery.refetch()}
        />
      ) : result.data.length === 0 ? (
        <DashboardEmptyState
          title={hasFilters ? "No events matched this view." : "No hosted events yet."}
          description={
            hasFilters
              ? "Try a broader search or clear the active filters to see more events."
              : "As soon as you start hosting events, they will show up here with quick management links."
          }
          action={
            hasFilters ? (
              <Button type="button" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/create-event">Create event</Link>
              </Button>
            )
          }
        />
      ) : (
        <DashboardTableSurface>
          <Table className="min-w-[980px]">
            <TableHeader className="bg-muted/25">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-4">Event</TableHead>
                <TableHead className="px-5 py-4">Date</TableHead>
                <TableHead className="px-5 py-4">Type</TableHead>
                <TableHead className="px-5 py-4">Status</TableHead>
                <TableHead className="px-5 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((event) => (
                <ManagedEventTableRow key={event.id} event={event} />
              ))}
            </TableBody>
          </Table>
        </DashboardTableSurface>
      )}

      {result.meta ? (
        <DashboardPagination
          meta={result.meta}
          isPending={myEventsQuery.isFetching}
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

const ManagedEventTableRow = React.memo(function ManagedEventTableRow({
  event,
}: {
  event: ManagedEvent;
}) {
  return (
    <TableRow>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[20rem] flex-col gap-2">
          <p className="font-semibold text-foreground">{event.title}</p>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {event.summary ||
              (event.locationType === "ONLINE"
                ? "Online event"
                : event.venue || "In-person event")}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <span className="inline-block min-w-[12rem] text-sm font-medium text-foreground">
          {formatDashboardDateTime(event.startsAt)}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <span className="inline-block min-w-[11rem] text-sm text-foreground">
          {formatEventType(event)}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <DashboardBadge tone={getEventTone(event.status)}>
          {formatDashboardEnum(event.status)}
        </DashboardBadge>
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <div className="flex justify-end">
          <Button asChild size="sm">
            <Link href={`/dashboard/my-events/${event.id}`}>Manage</Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

function getEventTone(status: ManagedEvent["status"]) {
  if (status === "PUBLISHED") {
    return "success";
  }

  if (status === "DRAFT") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "info";
}

function formatEventType(event: ManagedEvent) {
  return `${formatDashboardEnum(event.visibility)} / ${formatDashboardEnum(event.pricingType)}`;
}

export { MyEventsWorkspace };
