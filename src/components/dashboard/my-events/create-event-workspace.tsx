"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  createManagedEventFormState,
  ManagedEventForm,
} from "@/components/dashboard/managed-event-form";
import { createManagedEvent } from "@/lib/managed-events-api";

function CreateEventWorkspace() {
  const router = useRouter();
  const initialState = React.useMemo(() => createManagedEventFormState(), []);
  const [feedback, setFeedback] = React.useState<{
    tone: "danger" | "success";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(parameters: Parameters<typeof createManagedEvent>[0]) {
    setFeedback(null);

    try {
      setIsSubmitting(true);
      const result = await createManagedEvent(parameters);
      router.push(`/dashboard/my-events/${result.data.id}`);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create this event right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ManagedEventForm
      mode="create"
      initialState={initialState}
      feedback={feedback}
      isSubmitting={isSubmitting}
      cancelHref="/dashboard/my-events"
      onSubmit={(payload) =>
        handleSubmit(payload as Parameters<typeof createManagedEvent>[0])
      }
    />
  );
}

export { CreateEventWorkspace };
