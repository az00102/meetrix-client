"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  buildManagedEventFormStateFromEvent,
  ManagedEventForm,
} from "@/components/dashboard/managed-event-form";
import type { ManagedEvent } from "@/lib/dashboard-contract";
import { updateManagedEvent } from "@/lib/managed-events-api";

function EditEventWorkspace({
  event,
}: {
  event: ManagedEvent;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = React.useState<{
    tone: "danger" | "success";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const initialState = React.useMemo(
    () => buildManagedEventFormStateFromEvent(event),
    [event]
  );

  async function handleSubmit(parameters: Parameters<typeof updateManagedEvent>[1]) {
    setFeedback(null);

    try {
      setIsSubmitting(true);
      const result = await updateManagedEvent(event.id, parameters);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-events"] }),
        queryClient.invalidateQueries({
          queryKey: ["event-participants", event.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["sent-invitations"] }),
      ]);
      router.push(`/dashboard/my-events/${result.data.id}`);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update this event right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ManagedEventForm
      mode="edit"
      initialState={initialState}
      feedback={feedback}
      isSubmitting={isSubmitting}
      cancelHref={`/dashboard/my-events/${event.id}`}
      onSubmit={(payload) =>
        handleSubmit(payload as Parameters<typeof updateManagedEvent>[1])
      }
    />
  );
}

export { EditEventWorkspace };
