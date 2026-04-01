"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

import { EditProfileSheet } from "@/components/dashboard/edit-profile-sheet";
import { useAuthSession } from "@/components/shared/auth-session-provider";
import { Button } from "@/components/ui/button";
import type { CurrentUserProfile } from "@/lib/profile-contract";
import { cn } from "@/lib/utils";

function ProfilePageActions({
  profile,
}: {
  profile: CurrentUserProfile;
}) {
  const router = useRouter();
  const { markAuthenticated, markGuest } = useAuthSession();
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(
    null
  );
  const [isPending, startTransition] = React.useTransition();

  function refreshProfile() {
    setFeedbackMessage(null);
    startTransition(() => {
      router.refresh();
    });
  }

  function handleProfileUpdated(message: string) {
    setFeedbackMessage(message);
    markAuthenticated();
    startTransition(() => {
      router.refresh();
    });
  }

  function handleUnauthorized(message: string) {
    setFeedbackMessage(message);
    markGuest();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      {feedbackMessage ? (
        <p className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          {feedbackMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back home</Link>
        </Button>

        <EditProfileSheet
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
          onUnauthorized={handleUnauthorized}
        />

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={refreshProfile}
          disabled={isPending}
        >
          {isPending ? "Refreshing..." : "Refresh profile"}
          <RefreshCwIcon
            data-icon="inline-end"
            className={cn(isPending && "animate-spin")}
          />
        </Button>
      </div>
    </div>
  );
}

export { ProfilePageActions };
