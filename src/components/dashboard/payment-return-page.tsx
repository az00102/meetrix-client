"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DashboardBadge,
  DashboardBreadcrumbs,
  DashboardErrorState,
} from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import type {
  AuthenticatedItemResult,
  PaymentRecord,
  PaymentReturnStatus,
} from "@/lib/dashboard-contract";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import {
  formatDashboardDateTime,
  formatDashboardEnum,
  formatDashboardMoney,
} from "@/lib/dashboard-display";
import { getPaymentById } from "@/lib/payment-api";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 3_000;
const POLL_WINDOW_MS = 18_000;

function PaymentReturnPage({
  paymentId,
  initialGatewayStatus,
  initialPaymentResult,
}: {
  paymentId?: string;
  initialGatewayStatus?: string;
  initialPaymentResult: AuthenticatedItemResult<PaymentRecord>;
}) {
  const queryClient = useQueryClient();
  const [pollingStartedAt, setPollingStartedAt] = React.useState<number | null>(null);
  const [pollingActive, setPollingActive] = React.useState(
    initialPaymentResult.data?.status === "PENDING"
  );
  const invalidatedKeyRef = React.useRef<string | null>(null);

  const paymentQuery = useQuery({
    queryKey: paymentId
      ? dashboardQueryKeys.paymentDetail(paymentId)
      : ["payment-detail", "missing"],
    queryFn: ({ signal }) =>
      paymentId
        ? getPaymentById(paymentId, signal)
        : Promise.resolve({
            data: null,
            errorMessage: "Invalid payment return.",
            errorStatus: 400,
          } satisfies AuthenticatedItemResult<PaymentRecord>),
    enabled: Boolean(paymentId),
    initialData: paymentId ? initialPaymentResult : undefined,
    refetchInterval: (query) => {
      const payment = query.state.data?.data;

      if (!payment || payment.status !== "PENDING" || !pollingActive) {
        return false;
      }

      return POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: false,
  });

  const result = paymentQuery.data ?? initialPaymentResult;
  const payment = result.data;
  const isPaymentPending = payment?.status === "PENDING";
  const returnState = resolveReturnState(payment, paymentId);

  React.useEffect(() => {
    if (!isPaymentPending) {
      if (pollingActive) {
        setPollingActive(false);
      }
      return;
    }

    if (pollingStartedAt === null) {
      setPollingStartedAt(Date.now());
      setPollingActive(true);
      return;
    }

    if (!pollingActive) {
      return;
    }

    const remainingMs = POLL_WINDOW_MS - (Date.now() - pollingStartedAt);

    if (remainingMs <= 0) {
      setPollingActive(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPollingActive(false);
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [isPaymentPending, pollingActive, pollingStartedAt]);

  React.useEffect(() => {
    if (!payment || payment.status === "PENDING") {
      return;
    }

    const invalidationKey = `${payment.id}:${payment.status}:${payment.requiresManualReview}`;

    if (invalidatedKeyRef.current === invalidationKey) {
      return;
    }

    invalidatedKeyRef.current = invalidationKey;

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-payments"] }),
      queryClient.invalidateQueries({ queryKey: ["my-participations"] }),
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] }),
      queryClient.invalidateQueries({ queryKey: ["sent-invitations"] }),
    ]);
  }, [payment, queryClient]);

  if (result.errorStatus === 401) {
    return (
      <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
        <DashboardBreadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Payments", href: "/dashboard/payments" },
            { label: "Return" },
          ]}
        />
        <DashboardErrorState
          title="Sign in to verify this payment"
          description={
            result.errorMessage ??
            "Your session is no longer active. Log in again to continue."
          }
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Payments", href: "/dashboard/payments" },
          { label: "Return" },
        ]}
      />

      <section
        className={cn(
          "rounded-[2rem] border p-6 shadow-sm sm:p-8",
          returnState.tone === "success" &&
            "border-emerald-500/20 bg-emerald-500/5",
          returnState.tone === "warning" &&
            "border-amber-500/20 bg-amber-500/5",
          returnState.tone === "danger" &&
            "border-destructive/20 bg-destructive/5",
          returnState.tone === "default" && "border-border bg-card"
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <DashboardBadge tone={returnState.tone}>
              {formatReturnStateLabel(returnState.status)}
            </DashboardBadge>
            {payment?.status ? (
              <DashboardBadge tone={getPaymentTone(payment.status)}>
                {formatDashboardEnum(payment.status)}
              </DashboardBadge>
            ) : null}
            {payment?.requiresManualReview ? (
              <DashboardBadge tone="warning">Manual review</DashboardBadge>
            ) : null}
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {returnState.title}
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {returnState.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/payments">Back to payments</Link>
            </Button>
            {payment?.purpose === "INVITATION_ACCEPTANCE" ? (
              <Button asChild variant="outline">
                <Link href="/dashboard/invitations">Go to invitations</Link>
              </Button>
            ) : payment?.event?.slug ? (
              <Button asChild variant="outline">
                <Link href={`/events/${payment.event.slug}`}>View event</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/dashboard/participations">Go to participations</Link>
              </Button>
            )}
            {isPaymentPending && !pollingActive ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPollingStartedAt(Date.now());
                  setPollingActive(true);
                  void paymentQuery.refetch();
                }}
                disabled={paymentQuery.isFetching}
              >
                {paymentQuery.isFetching ? "Refreshing..." : "Refresh status"}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {payment ? (
        <section className="grid gap-4 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
          <ReturnMetaCard
            label="Event"
            value={payment.event?.title ?? "Event unavailable"}
            meta={
              payment.event
                ? `${formatDashboardEnum(payment.event.visibility)} · ${formatDashboardEnum(payment.event.pricingType)}`
                : undefined
            }
          />
          <ReturnMetaCard
            label="Amount"
            value={formatDashboardMoney(payment.amount, payment.currency)}
            meta={`${formatDashboardEnum(payment.provider)} provider`}
          />
          <ReturnMetaCard
            label="Gateway"
            value={payment.gatewayStatus ? formatDashboardEnum(payment.gatewayStatus) : "Pending"}
            meta={
              payment.providerTransactionId
                ? `Reference ${payment.providerTransactionId}`
                : "Reference pending"
            }
          />
          <ReturnMetaCard
            label="Timeline"
            value={payment.paidAt ? formatDashboardDateTime(payment.paidAt) : "Not paid yet"}
            meta={`Created ${formatDashboardDateTime(payment.createdAt)}`}
          />
          {payment.manualReviewReason ? (
            <ReturnMetaCard
              label="Manual review"
              value="Needs review"
              meta={payment.manualReviewReason}
            />
          ) : null}
          {payment.failureReason ? (
            <ReturnMetaCard
              label="Failure reason"
              value={payment.failureReason}
              meta={
                initialGatewayStatus
                  ? `Reported as ${formatDashboardEnum(initialGatewayStatus)} by the payment provider`
                  : undefined
              }
            />
          ) : null}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm leading-7 text-muted-foreground">
              {result.errorMessage ??
                (initialGatewayStatus
                  ? `The payment provider reported ${formatDashboardEnum(initialGatewayStatus)}, but the payment record could not be verified.`
                  : "The payment record could not be verified from this return URL.")}
            </p>
          </section>
      )}
    </main>
  );
}

function ReturnMetaCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground">{value}</p>
        {meta ? <p className="text-sm leading-6 text-muted-foreground">{meta}</p> : null}
      </div>
    </article>
  );
}

function resolveReturnState(
  payment: PaymentRecord | null,
  paymentId: string | undefined
): {
  status: PaymentReturnStatus;
  tone: "default" | "success" | "warning" | "danger";
  title: string;
  description: string;
} {
  if (!paymentId || !payment) {
      return {
        status: "invalid",
        tone: "danger",
        title: "Invalid payment return",
        description:
          "We couldn't confirm this payment from the return link. Open your payment history to verify the final status.",
      };
  }

  if (payment.status === "PENDING") {
    return {
      status: "processing",
      tone: "warning",
      title: "Payment still processing",
      description:
        "We're checking the latest gateway result now. If it stays pending, use manual refresh in a moment to verify the final status.",
    };
  }

  if (payment.requiresManualReview) {
    return {
      status: "manual_review",
      tone: "warning",
      title: "Payment needs manual review",
      description:
        payment.manualReviewReason ??
        "Your payment was received, but it still needs a manual review before access is finalized.",
    };
  }

  if (
    payment.status === "PAID" &&
    payment.purpose === "INVITATION_ACCEPTANCE" &&
    payment.invitation?.status === "ACCEPTED"
  ) {
    return {
      status: "invitation_accepted",
      tone: "success",
      title: "Invitation accepted",
      description:
        "Your payment was confirmed and the invitation has been accepted successfully.",
    };
  }

  if (payment.status === "PAID") {
    return {
      status: "success_awaiting_approval",
      tone: "success",
      title: "Payment successful, awaiting approval",
      description:
        "Your payment was confirmed successfully. If this event requires approval, the final access decision will appear in your dashboard shortly.",
    };
  }

  if (payment.status === "CANCELLED" || payment.status === "REFUNDED") {
    return {
      status: "cancelled",
      tone: "danger",
      title: "Payment cancelled",
      description:
        "This payment was cancelled before completion. You can start a fresh checkout from the related invitation or event page.",
    };
  }

  if (payment.status === "FAILED" || payment.status === "UNPAID") {
    return {
      status: "failed",
      tone: "danger",
      title: "Payment failed",
      description:
        payment.failureReason ??
        "The gateway did not confirm this payment. Try again from the related event or invitation when you're ready.",
    };
  }

  return {
    status: "invalid",
    tone: "danger",
    title: "Invalid payment return",
    description:
      "We couldn't confirm the final status for this payment yet. Check your payment history for the latest update.",
  };
}

function formatReturnStateLabel(status: PaymentReturnStatus) {
  if (status === "success_awaiting_approval") {
    return "Success";
  }

  if (status === "invitation_accepted") {
    return "Accepted";
  }

  if (status === "manual_review") {
    return "Review";
  }

  if (status === "processing") {
    return "Processing";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  if (status === "failed") {
    return "Failed";
  }

  return "Invalid";
}

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

export { PaymentReturnPage };
