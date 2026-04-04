"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/components/shared/auth-session-provider";
import { Button } from "@/components/ui/button";
import type {
  EventAccessPrimaryAction,
  PublicEventAccessState,
  PublicEventDetail,
} from "@/lib/event-contract";
import { acceptInvitation } from "@/lib/invitation-api";
import { initiatePayment } from "@/lib/payment-api";
import { joinEvent } from "@/lib/participation-api";

function EventDetailActions({
  event,
  accessState,
  accessStateErrorMessage,
}: {
  event: Pick<
    PublicEventDetail,
    "id" | "slug"
  >;
  accessState?: PublicEventAccessState | null;
  accessStateErrorMessage?: string | null;
}) {
  const router = useRouter();
  const { status } = useAuthSession();
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [activeAction, setActiveAction] = React.useState<string | null>(null);

  const accessStateUnavailable =
    status === "authenticated" &&
    (!accessState || accessState.viewer.isAuthenticated === false);
  const primaryAction: EventAccessPrimaryAction =
    accessState?.accessState.primaryAction ?? "LOG_IN";
  const actionReason =
    feedback ??
    (accessStateUnavailable
      ? accessStateErrorMessage ??
        "We couldn't confirm your access to this event right now. Open your dashboard or refresh access to try again."
      : accessState?.accessState.reason ?? null);
  const invitationId = accessState?.invitation?.id ?? null;
  const paymentRedirectUrl = accessState?.latestPayment?.redirectUrl ?? null;
  const canManageEvent = accessState?.viewer.canManageEvent ?? false;

  async function startPayment(
    payload:
      | {
          purpose: "EVENT_REGISTRATION";
          eventId: string;
        }
      | {
          purpose: "INVITATION_ACCEPTANCE";
          invitationId: string;
        }
  ) {
    const result = await initiatePayment(payload);

    if (result.data.redirectUrl) {
      window.location.assign(result.data.redirectUrl);
      return;
    }

    throw new Error("The payment session could not be started right now.");
  }

  async function handlePrimaryAction(action: EventAccessPrimaryAction) {
    try {
      setFeedback(null);

      if (action === "PAY_TO_REQUEST_ACCESS") {
        setActiveAction(action);
        await startPayment({
          purpose: "EVENT_REGISTRATION",
          eventId: event.id,
        });
        return;
      }

      if (action === "PAY_INVITATION") {
        if (!invitationId) {
          throw new Error("This invitation is no longer available.");
        }

        setActiveAction(action);
        await startPayment({
          purpose: "INVITATION_ACCEPTANCE",
          invitationId,
        });
        return;
      }

      if (action === "COMPLETE_PAYMENT") {
        if (paymentRedirectUrl) {
          setActiveAction(action);
          window.location.assign(paymentRedirectUrl);
          return;
        }

        if (invitationId) {
          setActiveAction(action);
          await startPayment({
            purpose: "INVITATION_ACCEPTANCE",
            invitationId,
          });
          return;
        }

        setActiveAction(action);
        await startPayment({
          purpose: "EVENT_REGISTRATION",
          eventId: event.id,
        });
        return;
      }

      if (action === "ACCEPT_INVITATION") {
        if (!invitationId) {
          throw new Error("This invitation is no longer available.");
        }

        setActiveAction(action);
        await acceptInvitation(invitationId);
        router.push("/dashboard/participations");
        router.refresh();
        return;
      }

      if (action === "JOIN_EVENT" || action === "REQUEST_ACCESS") {
        setActiveAction(action);
        const result = await joinEvent(event.id);
        const nextMessage =
          result.data.action === "joined"
            ? "You joined the event successfully."
            : "Your access request has been sent.";

        setFeedback(nextMessage);
        router.push("/dashboard/participations");
        router.refresh();
      }
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to complete this action right now."
      );
    } finally {
      setActiveAction(null);
    }
  }

  function getPrimaryActionLabel(action: EventAccessPrimaryAction) {
    switch (action) {
      case "LOG_IN":
        return "Log in to continue";
      case "MANAGE_EVENT":
        return "Manage event";
      case "VIEW_PARTICIPATION":
        return "Open participation";
      case "VIEW_INVITATIONS":
        return "Open invitations";
      case "JOIN_EVENT":
        return "Join event";
      case "REQUEST_ACCESS":
        return "Request access";
      case "PAY_TO_REQUEST_ACCESS":
        return "Pay to request access";
      case "PAY_INVITATION":
        return "Pay invitation fee";
      case "ACCEPT_INVITATION":
        return "Accept invitation";
      case "COMPLETE_PAYMENT":
        return "Complete payment";
      case "NONE":
        return "";
      default:
        return "Continue";
    }
  }

  function getBusyLabel(action: EventAccessPrimaryAction) {
    switch (action) {
      case "PAY_TO_REQUEST_ACCESS":
      case "PAY_INVITATION":
      case "COMPLETE_PAYMENT":
        return "Redirecting...";
      case "ACCEPT_INVITATION":
        return "Accepting...";
      case "JOIN_EVENT":
        return "Joining...";
      case "REQUEST_ACCESS":
        return "Sending request...";
      default:
        return "Working...";
    }
  }

  function renderPrimaryAction() {
    if (accessStateUnavailable) {
      return (
        <>
          <Button asChild size="lg">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => router.refresh()}
          >
            Refresh access
          </Button>
        </>
      );
    }

    if (primaryAction === "LOG_IN") {
      return (
        <Button asChild size="lg">
          <Link href="/login">{getPrimaryActionLabel(primaryAction)}</Link>
        </Button>
      );
    }

    if (primaryAction === "MANAGE_EVENT") {
      return (
        <Button asChild size="lg">
          <Link href={`/dashboard/my-events/${event.id}`}>
            {getPrimaryActionLabel(primaryAction)}
          </Link>
        </Button>
      );
    }

    if (primaryAction === "VIEW_PARTICIPATION") {
      return (
        <Button asChild size="lg">
          <Link href="/dashboard/participations">
            {getPrimaryActionLabel(primaryAction)}
          </Link>
        </Button>
      );
    }

    if (primaryAction === "VIEW_INVITATIONS") {
      return (
        <Button asChild size="lg">
          <Link href="/dashboard/invitations">
            {getPrimaryActionLabel(primaryAction)}
          </Link>
        </Button>
      );
    }

    if (primaryAction === "NONE") {
      return null;
    }

    return (
      <Button
        type="button"
        size="lg"
        onClick={() => void handlePrimaryAction(primaryAction)}
        disabled={activeAction !== null}
      >
        {activeAction === primaryAction
          ? getBusyLabel(primaryAction)
          : getPrimaryActionLabel(primaryAction)}
      </Button>
    );
  }

  function getPrimaryActionHref(action: EventAccessPrimaryAction) {
    if (action === "LOG_IN") {
      return "/login";
    }

    if (action === "MANAGE_EVENT") {
      return `/dashboard/my-events/${event.id}`;
    }

    if (action === "VIEW_PARTICIPATION") {
      return "/dashboard/participations";
    }

    if (action === "VIEW_INVITATIONS") {
      return "/dashboard/invitations";
    }

    return null;
  }

  const secondaryLink = canManageEvent
    ? {
        href: `/dashboard/my-events/${event.id}`,
        label: "Host workspace",
      }
    : status === "authenticated"
      ? accessState?.invitation
        ? {
            href: "/dashboard/invitations",
            label: "Open invitations",
          }
        : {
            href: "/dashboard/participations",
            label: "Open participations",
          }
      : {
          href: "/events",
          label: "Browse events",
        };
  const shouldRenderSecondaryLink =
    !accessStateUnavailable &&
    getPrimaryActionHref(primaryAction) !== secondaryLink.href;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {renderPrimaryAction()}
        {shouldRenderSecondaryLink ? (
          <Button asChild size="lg" variant="outline">
            <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
          </Button>
        ) : null}
      </div>

      {actionReason ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {actionReason}
        </p>
      ) : null}
    </div>
  );
}

export { EventDetailActions };
