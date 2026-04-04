"use client";

import * as React from "react";
import Link from "next/link";

import {
  DashboardBadge,
  DashboardField,
  DashboardFilterSelect,
  DashboardTextareaField,
} from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { formatDashboardEnum, formatDashboardMoney } from "@/lib/dashboard-display";
import type {
  CreateManagedEventPayload,
  EventLocationType,
  EventPricingType,
  EventStatus,
  EventVisibility,
  ManagedEvent,
  UpdateManagedEventPayload,
} from "@/lib/dashboard-contract";

const LOCATION_OPTIONS = [
  { label: "Online", value: "ONLINE" },
  { label: "In person", value: "OFFLINE" },
] as const;

const VISIBILITY_OPTIONS = [
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
] as const;

const PRICING_OPTIONS = [
  { label: "Free", value: "FREE" },
  { label: "Paid", value: "PAID" },
] as const;

type ManagedEventFormMode = "create" | "edit";

type ManagedEventFormState = {
  title: string;
  summary: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  locationType: EventLocationType;
  venue: string;
  eventLink: string;
  visibility: EventVisibility;
  pricingType: EventPricingType;
  registrationFee: string;
  currency: string;
  capacity: string;
  bannerImage: string;
  status: EventStatus;
};

const DEFAULT_MANAGED_EVENT_FORM_STATE: ManagedEventFormState = {
  title: "",
  summary: "",
  description: "",
  startsAt: "",
  endsAt: "",
  timezone: "UTC",
  locationType: "ONLINE",
  venue: "",
  eventLink: "",
  visibility: "PUBLIC",
  pricingType: "FREE",
  registrationFee: "0",
  currency: "BDT",
  capacity: "",
  bannerImage: "",
  status: "DRAFT",
};

function ManagedEventForm({
  mode,
  initialState,
  feedback,
  isSubmitting,
  cancelHref,
  onSubmit,
}: {
  mode: ManagedEventFormMode;
  initialState: ManagedEventFormState;
  feedback: {
    tone: "danger" | "success";
    message: string;
  } | null;
  isSubmitting: boolean;
  cancelHref: string;
  onSubmit: (
    payload: CreateManagedEventPayload | UpdateManagedEventPayload
  ) => Promise<void> | void;
}) {
  const [formState, setFormState] = React.useState(initialState);
  const [validationMessage, setValidationMessage] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    setFormState(initialState);
    setValidationMessage(null);
  }, [initialState]);

  React.useEffect(() => {
    if (mode !== "create" || typeof window === "undefined") {
      return;
    }

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimezone) {
      setFormState((currentValue) =>
        currentValue.timezone === "UTC"
          ? { ...currentValue, timezone: browserTimezone }
          : currentValue
      );
    }
  }, [mode]);

  const accessMode = getAccessMode(formState.visibility, formState.pricingType);
  const statusOptions = getStatusOptions(mode, formState.status);
  const visibleFeedback =
    validationMessage !== null
      ? {
          tone: "danger" as const,
          message: validationMessage,
        }
      : feedback;

  function updateField<Key extends keyof ManagedEventFormState>(
    key: Key,
    value: ManagedEventFormState[Key]
  ) {
    setValidationMessage(null);
    setFormState((currentValue) => {
      const nextValue = {
        ...currentValue,
        [key]: value,
      };

      if (key === "locationType") {
        if (value === "ONLINE") {
          nextValue.venue = "";
        }

        if (value === "OFFLINE") {
          nextValue.eventLink = "";
        }
      }

      if (key === "pricingType" && value === "FREE") {
        nextValue.registrationFee = "0";
      }

      return nextValue;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValidationMessage = validateManagedEventForm(formState);

    if (nextValidationMessage) {
      setValidationMessage(nextValidationMessage);
      return;
    }

    setValidationMessage(null);
    await onSubmit(buildManagedEventPayload(mode, formState));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          {visibleFeedback ? (
            <p
              className={
                visibleFeedback.tone === "success"
                  ? "rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                  : "rounded-[1.5rem] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              }
            >
              {visibleFeedback.message}
            </p>
          ) : null}

          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DashboardField
                label="Event title"
                value={formState.title}
                onChange={(nextEvent) => updateField("title", nextEvent.target.value)}
                placeholder="Meetrix product launch"
                required
              />
              <DashboardField
                label="Timezone"
                value={formState.timezone}
                onChange={(nextEvent) =>
                  updateField("timezone", nextEvent.target.value)
                }
                placeholder="Asia/Dhaka"
                required
              />
            </div>

            <DashboardTextareaField
              label="Summary"
              value={formState.summary}
              onChange={(nextEvent) => updateField("summary", nextEvent.target.value)}
              placeholder="A short preview for cards and list views."
              rows={3}
            />

            <DashboardTextareaField
              label="Description"
              value={formState.description}
              onChange={(nextEvent) =>
                updateField("description", nextEvent.target.value)
              }
              placeholder="Describe the event, what attendees should expect, and any important context."
              rows={6}
              required
            />
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DashboardField
                label="Starts at"
                type="datetime-local"
                value={formState.startsAt}
                onChange={(nextEvent) =>
                  updateField("startsAt", nextEvent.target.value)
                }
                required
              />
              <DashboardField
                label="Ends at"
                type="datetime-local"
                value={formState.endsAt}
                onChange={(nextEvent) => updateField("endsAt", nextEvent.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <DashboardFilterSelect
                label="Location"
                value={formState.locationType}
                onChange={(value) =>
                  updateField("locationType", value as EventLocationType)
                }
                options={LOCATION_OPTIONS}
              />
              <DashboardFilterSelect
                label="Visibility"
                value={formState.visibility}
                onChange={(value) =>
                  updateField("visibility", value as EventVisibility)
                }
                options={VISIBILITY_OPTIONS}
              />
            </div>

            {formState.locationType === "ONLINE" ? (
              <DashboardField
                label="Event link"
                type="url"
                value={formState.eventLink}
                onChange={(nextEvent) =>
                  updateField("eventLink", nextEvent.target.value)
                }
                placeholder="https://meet.google.com/..."
                required
              />
            ) : (
              <DashboardField
                label="Venue"
                value={formState.venue}
                onChange={(nextEvent) => updateField("venue", nextEvent.target.value)}
                placeholder="Banani, Dhaka"
                required
              />
            )}
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DashboardFilterSelect
                label="Pricing"
                value={formState.pricingType}
                onChange={(value) =>
                  updateField("pricingType", value as EventPricingType)
                }
                options={PRICING_OPTIONS}
              />
              <DashboardFilterSelect
                label="Status"
                value={formState.status}
                onChange={(value) => updateField("status", value as EventStatus)}
                options={statusOptions}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <DashboardField
                label="Registration fee"
                type="number"
                min={0}
                step="0.01"
                value={formState.registrationFee}
                onChange={(nextEvent) =>
                  updateField("registrationFee", nextEvent.target.value)
                }
                disabled={formState.pricingType === "FREE"}
              />
              <DashboardField
                label="Currency"
                value={formState.currency}
                onChange={(nextEvent) =>
                  updateField("currency", nextEvent.target.value.toUpperCase())
                }
                placeholder="BDT"
                maxLength={3}
                required
              />
              <DashboardField
                label="Capacity"
                type="number"
                min={1}
                step="1"
                value={formState.capacity}
                onChange={(nextEvent) =>
                  updateField("capacity", nextEvent.target.value)
                }
                placeholder="Optional"
              />
            </div>

            <DashboardField
              label="Banner image"
              type="url"
              value={formState.bannerImage}
              onChange={(nextEvent) =>
                updateField("bannerImage", nextEvent.target.value)
              }
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {getSubmitLabel(mode, formState.status, isSubmitting)}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          </div>
        </form>
      </section>

      <aside className="grid gap-4 self-start">
        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <DashboardBadge>
                {formState.locationType === "ONLINE" ? "Online" : "In person"}
              </DashboardBadge>
              <DashboardBadge>{formatDashboardEnum(formState.visibility)}</DashboardBadge>
              <DashboardBadge>{formatDashboardEnum(formState.pricingType)}</DashboardBadge>
              <DashboardBadge tone={getStatusTone(formState.status)}>
                {formatDashboardEnum(formState.status)}
              </DashboardBadge>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {formState.title.trim() ||
                  (mode === "create" ? "New event" : "Untitled event")}
              </h1>
              <p className="text-sm leading-7 text-muted-foreground">
                {formState.summary.trim() ||
                  (mode === "create"
                    ? "Set up the core event details here, then manage invitations and participants from your host workspace."
                    : "Keep your event information current, then return to the host workspace to manage participants and invitations.")}
              </p>
            </div>

            <div className="grid gap-3">
              <PreviewItem
                label="Schedule"
                value={
                  formState.startsAt
                    ? formatLocalDateTime(formState.startsAt)
                    : "Add a start time"
                }
              />
              <PreviewItem label="Access" value={accessMode} />
              <PreviewItem
                label="Price"
                value={
                  formState.pricingType === "PAID"
                    ? formatDashboardMoney(
                        Number(formState.registrationFee || 0),
                        formState.currency || "BDT"
                      )
                    : "Free"
                }
              />
              <PreviewItem
                label={formState.locationType === "ONLINE" ? "Event link" : "Venue"}
                value={
                  formState.locationType === "ONLINE"
                    ? formState.eventLink.trim() || "Add the join link"
                    : formState.venue.trim() || "Add the venue"
                }
              />
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function createManagedEventFormState() {
  return { ...DEFAULT_MANAGED_EVENT_FORM_STATE };
}

function buildManagedEventFormStateFromEvent(
  event: ManagedEvent
): ManagedEventFormState {
  return {
    title: event.title,
    summary: event.summary ?? "",
    description: event.description,
    startsAt: formatDateTimeLocalInput(event.startsAt),
    endsAt: formatDateTimeLocalInput(event.endsAt),
    timezone: event.timezone,
    locationType: event.locationType,
    venue: event.venue ?? "",
    eventLink: event.eventLink ?? "",
    visibility: event.visibility,
    pricingType: event.pricingType,
    registrationFee:
      event.pricingType === "PAID" ? String(event.registrationFee) : "0",
    currency: event.currency,
    capacity: event.capacity ? String(event.capacity) : "",
    bannerImage: event.bannerImage ?? "",
    status: event.status,
  };
}

function PreviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-muted/35 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}

function getStatusOptions(mode: ManagedEventFormMode, status: EventStatus) {
  const options = [
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
  ];

  if (mode === "edit") {
    options.push({ label: "Cancelled", value: "CANCELLED" });
  }

  if (status === "COMPLETED") {
    options.push({ label: "Completed", value: "COMPLETED" });
  }

  return options;
}

function getSubmitLabel(
  mode: ManagedEventFormMode,
  status: EventStatus,
  isSubmitting: boolean
) {
  if (isSubmitting) {
    return mode === "create" ? "Creating..." : "Saving...";
  }

  if (mode === "create") {
    return status === "PUBLISHED" ? "Create and publish" : "Create draft";
  }

  if (status === "DRAFT") {
    return "Save draft";
  }

  return "Save changes";
}

function getStatusTone(status: EventStatus) {
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

function validateManagedEventForm(formState: ManagedEventFormState) {
  if (!formState.title.trim()) {
    return "Event title is required.";
  }

  if (!formState.description.trim()) {
    return "Event description is required.";
  }

  if (!formState.startsAt) {
    return "Start time is required.";
  }

  if (!formState.timezone.trim()) {
    return "Timezone is required.";
  }

  if (formState.endsAt) {
    const startsAt = new Date(formState.startsAt);
    const endsAt = new Date(formState.endsAt);

    if (endsAt <= startsAt) {
      return "Event end time must be after the start time.";
    }
  }

  if (formState.locationType === "ONLINE" && !formState.eventLink.trim()) {
    return "Event link is required for online events.";
  }

  if (formState.locationType === "OFFLINE" && !formState.venue.trim()) {
    return "Venue is required for offline events.";
  }

  if (
    formState.pricingType === "PAID" &&
    Number(formState.registrationFee || "0") <= 0
  ) {
    return "Paid events must have a registration fee greater than 0.";
  }

  return null;
}

function buildManagedEventPayload(
  mode: ManagedEventFormMode,
  formState: ManagedEventFormState
) {
  const sharedPayload = {
    title: formState.title.trim(),
    summary: formState.summary.trim() || null,
    description: formState.description.trim(),
    startsAt: new Date(formState.startsAt).toISOString(),
    endsAt: formState.endsAt ? new Date(formState.endsAt).toISOString() : null,
    timezone: formState.timezone.trim(),
    locationType: formState.locationType,
    venue:
      formState.locationType === "OFFLINE" ? formState.venue.trim() || null : null,
    eventLink:
      formState.locationType === "ONLINE"
        ? formState.eventLink.trim() || null
        : null,
    visibility: formState.visibility,
    pricingType: formState.pricingType,
    registrationFee:
      formState.pricingType === "PAID" ? Number(formState.registrationFee) : 0,
    currency: formState.currency.trim().toUpperCase(),
    capacity: formState.capacity ? Number(formState.capacity) : null,
    bannerImage: formState.bannerImage.trim() || null,
  };

  if (mode === "create") {
    return {
      ...sharedPayload,
      status: formState.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    } satisfies CreateManagedEventPayload;
  }

  return {
    ...sharedPayload,
    ...(formState.status === "COMPLETED"
      ? {}
      : {
          status: formState.status as UpdateManagedEventPayload["status"],
        }),
  } satisfies UpdateManagedEventPayload;
}

function getAccessMode(
  visibility: EventVisibility,
  pricingType: EventPricingType
) {
  if (visibility === "PRIVATE" && pricingType === "PAID") {
    return "Invite or approval with payment";
  }

  if (visibility === "PRIVATE") {
    return "Invite or approval required";
  }

  if (pricingType === "PAID") {
    return "Payment and approval required";
  }

  return "Open public access";
}

function formatLocalDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateTimeLocalInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

export {
  createManagedEventFormState,
  buildManagedEventFormStateFromEvent,
  ManagedEventForm,
};
export type { ManagedEventFormState };
