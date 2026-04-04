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
  PaymentRecord,
} from "@/lib/dashboard-contract";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import {
  formatDashboardDateTime,
  formatDashboardEnum,
  formatDashboardMoney,
} from "@/lib/dashboard-display";
import { getMyPayments } from "@/lib/payment-api";
import {
  buildPaymentsHref,
  DEFAULT_PAYMENTS_PAGE,
  type ResolvedPaymentsQuery,
  resolvePaymentsQueryFromSearchParams,
} from "@/lib/payments-route";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
] as const;

const PURPOSE_OPTIONS = [
  { label: "All purposes", value: "" },
  { label: "Event registration", value: "EVENT_REGISTRATION" },
  { label: "Invitation acceptance", value: "INVITATION_ACCEPTANCE" },
] as const;

const SORT_OPTIONS = [
  { label: "Recently created", value: "createdAt-desc" },
  { label: "Recently updated", value: "updatedAt-desc" },
  { label: "Recently paid", value: "paidAt-desc" },
  { label: "Amount high to low", value: "amount-desc" },
  { label: "Amount low to high", value: "amount-asc" },
] as const;

const EMPTY_PAYMENTS_RESULT = {
  data: [],
  meta: null,
  errorMessage: null,
  errorStatus: null,
} satisfies AuthenticatedListResult<PaymentRecord>;

function PaymentsWorkspace({
  initialQuery,
  initialResult,
}: {
  initialQuery: ResolvedPaymentsQuery;
  initialResult: AuthenticatedListResult<PaymentRecord>;
}) {
  const searchParams = useSearchParams();
  const activeQuery = resolvePaymentsQueryFromSearchParams(searchParams);
  const [searchTerm, setSearchTerm] = React.useState(initialQuery.searchTerm ?? "");

  React.useEffect(() => {
    setSearchTerm(activeQuery.searchTerm ?? "");
  }, [activeQuery.searchTerm]);

  function updateQuery(nextQuery: ResolvedPaymentsQuery) {
    const nextHref = buildPaymentsHref(nextQuery);
    const activeHref = buildPaymentsHref(activeQuery);

    if (nextHref === activeHref) {
      return;
    }

    window.history.pushState(null, "", nextHref);
  }

  const commitSearch = React.useEffectEvent((nextSearchTerm: string) => {
    updateQuery({
      ...activeQuery,
      page: DEFAULT_PAYMENTS_PAGE,
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

  const paymentsQuery = useQuery({
    queryKey: dashboardQueryKeys.myPayments(activeQuery),
    queryFn: ({ signal }) => getMyPayments(activeQuery, signal),
    placeholderData: keepPreviousData,
    initialData:
      buildPaymentsHref(activeQuery) === buildPaymentsHref(initialQuery)
        ? initialResult
        : undefined,
  });

  const result = paymentsQuery.data ?? EMPTY_PAYMENTS_RESULT;
  const isInitialLoading = paymentsQuery.isLoading && !paymentsQuery.data;
  const hasFilters = Boolean(
    activeQuery.searchTerm || activeQuery.status || activeQuery.purpose
  );
  const selectedSortValue = `${activeQuery.sortBy}-${activeQuery.sortOrder}`;

  function resetFilters() {
    setSearchTerm("");
    updateQuery({
      ...activeQuery,
      page: DEFAULT_PAYMENTS_PAGE,
      searchTerm: undefined,
      status: undefined,
      purpose: undefined,
    });
  }

  if (isInitialLoading) {
    return <DashboardListPageSkeleton filterCount={3} columnCount={5} />;
  }

  if (result.errorStatus === 401) {
    return (
      <DashboardErrorState
        title="Sign in to review your payments"
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(10rem,0.85fr))]">
            <DashboardSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by event title or payment ID"
              disabled={paymentsQuery.isFetching}
            />
            <DashboardFilterSelect
              label="Status"
              value={activeQuery.status ?? ""}
              disabled={paymentsQuery.isFetching}
              options={STATUS_OPTIONS}
              onChange={(value) =>
                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_PAYMENTS_PAGE,
                  status: (value || undefined) as ResolvedPaymentsQuery["status"],
                })
              }
            />
            <DashboardFilterSelect
              label="Purpose"
              value={activeQuery.purpose ?? ""}
              disabled={paymentsQuery.isFetching}
              options={PURPOSE_OPTIONS}
              onChange={(value) =>
                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_PAYMENTS_PAGE,
                  purpose: (value || undefined) as ResolvedPaymentsQuery["purpose"],
                })
              }
            />
            <DashboardFilterSelect
              label="Sort"
              value={selectedSortValue}
              disabled={paymentsQuery.isFetching}
              options={SORT_OPTIONS}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");

                updateQuery({
                  ...activeQuery,
                  page: DEFAULT_PAYMENTS_PAGE,
                  sortBy: sortBy as ResolvedPaymentsQuery["sortBy"],
                  sortOrder: sortOrder as ResolvedPaymentsQuery["sortOrder"],
                });
              }}
            />
          </div>
        }
        summary={
          <>
            <p className="font-medium text-foreground">
              {result.meta?.total ?? result.data.length} payment
              {(result.meta?.total ?? result.data.length) === 1 ? "" : "s"}
            </p>
            {result.meta ? (
              <p className="text-muted-foreground">
                Page {result.meta.page} of {result.meta.totalPages}
              </p>
            ) : null}
            {paymentsQuery.isFetching ? (
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
              disabled={paymentsQuery.isFetching}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      {result.errorMessage ? (
        <DashboardErrorState
          title="We couldn't load your payment history"
          description={result.errorMessage}
          onRetry={() => void paymentsQuery.refetch()}
        />
      ) : result.data.length === 0 ? (
        <DashboardEmptyState
          title={hasFilters ? "No payments matched this view." : "No payments yet."}
          description={
            hasFilters
              ? "Try a broader search or clear the active filters to see more payment activity."
              : "Any paid registrations or paid invitation acceptances will show up here."
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
                <TableHead className="px-5 py-4">Amount</TableHead>
                <TableHead className="px-5 py-4">Status</TableHead>
                <TableHead className="px-5 py-4">Date</TableHead>
                <TableHead className="px-5 py-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((payment) => (
                <PaymentTableRow key={payment.id} payment={payment} />
              ))}
            </TableBody>
          </Table>
        </DashboardTableSurface>
      )}

      {result.meta ? (
        <DashboardPagination
          meta={result.meta}
          isPending={paymentsQuery.isFetching}
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

const PaymentTableRow = React.memo(function PaymentTableRow({
  payment,
}: {
  payment: PaymentRecord;
}) {
  const returnHref = `/dashboard/payments/return?paymentId=${encodeURIComponent(payment.id)}`;

  return (
    <TableRow>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[16rem] flex-col gap-2">
          <p className="font-semibold text-foreground">
            {payment.event?.title ?? "Event unavailable"}
          </p>
          <p className="text-xs text-muted-foreground">
            {payment.event
              ? `${formatDashboardEnum(payment.event.visibility)} • ${formatDashboardEnum(payment.event.pricingType)}`
              : "Archived event"}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <span className="inline-block min-w-[10rem] text-sm font-semibold text-foreground">
          {formatDashboardMoney(payment.amount, payment.currency)}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="min-w-[14rem]">
          <DashboardBadge tone={getCombinedPaymentTone(payment)}>
            {formatCombinedPaymentStatus(payment)}
          </DashboardBadge>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <span className="inline-block min-w-[12rem] text-sm font-medium text-foreground">
          {formatDashboardDateTime(payment.paidAt ?? payment.createdAt)}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={returnHref}>Status</Link>
          </Button>
          {payment.event ? (
            <Button asChild size="sm" variant="ghost">
              <Link href={`/events/${payment.event.slug}`}>Event</Link>
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
});

function getPaymentTone(status: PaymentRecord["status"]) {
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

function getGatewayTone(gatewayStatus: string) {
  const normalizedValue = gatewayStatus.toUpperCase();

  if (normalizedValue.includes("VALID") || normalizedValue.includes("SUCCESS")) {
    return "success";
  }

  if (normalizedValue.includes("PENDING") || normalizedValue.includes("INIT")) {
    return "warning";
  }

  if (
    normalizedValue.includes("FAILED") ||
    normalizedValue.includes("CANCEL") ||
    normalizedValue.includes("INVALID")
  ) {
    return "danger";
  }

  return "default";
}

function getGatewayStatusLabel(payment: PaymentRecord) {
  if (payment.requiresManualReview) {
    return "Manual review";
  }

  if (payment.gatewayStatus) {
    return formatDashboardEnum(payment.gatewayStatus);
  }

  return "Awaiting gateway";
}

function getCombinedPaymentTone(payment: PaymentRecord) {
  const paymentTone = getPaymentTone(payment.status);
  const gatewayTone = payment.requiresManualReview
    ? "warning"
    : payment.gatewayStatus
      ? getGatewayTone(payment.gatewayStatus)
      : "default";

  if (paymentTone === "danger" || gatewayTone === "danger") {
    return "danger";
  }

  if (paymentTone === "warning" || gatewayTone === "warning") {
    return "warning";
  }

  if (paymentTone === "success" || gatewayTone === "success") {
    return "success";
  }

  return "default";
}

function formatCombinedPaymentStatus(payment: PaymentRecord) {
  return `${formatDashboardEnum(payment.status)} • ${getGatewayStatusLabel(payment)}`;
}

export { PaymentsWorkspace };
