"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { useAuthSession } from "@/components/shared/auth-session-provider";
import { Button } from "@/components/ui/button";

function AuthAwareEventCta({
  eventLink,
  eventLabel = "Open event",
  guestLabel = "Create your account",
  authenticatedLabel = "Open dashboard",
  authenticatedHref = "/dashboard",
  showArrow = false,
  size = "lg",
}: {
  eventLink?: string | null;
  eventLabel?: string;
  guestLabel?: string;
  authenticatedLabel?: string;
  authenticatedHref?: string;
  showArrow?: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { status } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const content = (
    <>
      {eventLink
        ? eventLabel
        : isAuthenticated
          ? authenticatedLabel
          : guestLabel}
      {showArrow ? <ArrowRightIcon data-icon="inline-end" /> : null}
    </>
  );

  if (eventLink) {
    return (
      <Button asChild size={size}>
        <a href={eventLink} target="_blank" rel="noreferrer">
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size={size}>
      <Link href={isAuthenticated ? authenticatedHref : "/register"}>
        {content}
      </Link>
    </Button>
  );
}

export { AuthAwareEventCta };
