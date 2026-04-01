import type { PublicEventCard } from "@/lib/event-contract";

type EventScheduleInput = Pick<PublicEventCard, "startsAt" | "endsAt" | "timezone">;
type EventLocationInput = Pick<
  PublicEventCard,
  "eventLink" | "locationType" | "venue"
>;
type EventAccessInput = Pick<
  PublicEventCard,
  "pricingType" | "registrationFee" | "currency" | "requiresApproval" | "requiresPayment"
>;

function formatWithTimeZone(
  value: string,
  options: Intl.DateTimeFormatOptions,
  timeZone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone,
  }).format(new Date(value));
}

function isSameCalendarDay(start: string, end: string, timeZone: string) {
  const startLabel = formatWithTimeZone(
    start,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    timeZone
  );
  const endLabel = formatWithTimeZone(
    end,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    timeZone
  );

  return startLabel === endLabel;
}

function formatEventScheduleLabel({
  startsAt,
  endsAt,
  timezone,
}: EventScheduleInput) {
  const startDate = formatWithTimeZone(
    startsAt,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
    timezone
  );
  const startTime = formatWithTimeZone(
    startsAt,
    {
      hour: "numeric",
      minute: "2-digit",
    },
    timezone
  );

  if (!endsAt) {
    return `${startDate} at ${startTime}`;
  }

  const endDate = formatWithTimeZone(
    endsAt,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
    timezone
  );
  const endTime = formatWithTimeZone(
    endsAt,
    {
      hour: "numeric",
      minute: "2-digit",
    },
    timezone
  );

  if (isSameCalendarDay(startsAt, endsAt, timezone)) {
    return `${startDate} - ${startTime} to ${endTime}`;
  }

  return `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
}

function formatEventDayLabel(startsAt: string, timezone: string) {
  return formatWithTimeZone(
    startsAt,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
    timezone
  );
}

function formatEventMonthLabel(startsAt: string, timezone: string) {
  return formatWithTimeZone(
    startsAt,
    {
      month: "short",
    },
    timezone
  );
}

function formatEventDayNumberLabel(startsAt: string, timezone: string) {
  return formatWithTimeZone(
    startsAt,
    {
      day: "2-digit",
    },
    timezone
  );
}

function formatEventPriceLabel({
  pricingType,
  registrationFee,
  currency,
}: Pick<EventAccessInput, "pricingType" | "registrationFee" | "currency">) {
  if (pricingType === "FREE") {
    return "Free";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(registrationFee) ? 0 : 2,
    }).format(registrationFee);
  } catch {
    return `${currency} ${registrationFee}`;
  }
}

function formatEventLocationLabel({
  locationType,
  venue,
  eventLink,
}: EventLocationInput) {
  if (locationType === "ONLINE") {
    return eventLink ? "Online access after registration" : "Online event";
  }

  return venue?.trim() || "Venue to be announced";
}

function getEventAccessLabel({
  requiresApproval,
  requiresPayment,
}: Pick<EventAccessInput, "requiresApproval" | "requiresPayment">) {
  if (requiresApproval && requiresPayment) {
    return "Approval + payment";
  }

  if (requiresPayment) {
    return "Paid access";
  }

  if (requiresApproval) {
    return "Approval required";
  }

  return "Open registration";
}

function formatEventAccessLabel(event: EventAccessInput) {
  return `${formatEventPriceLabel(event)} - ${getEventAccessLabel(event)}`;
}

export {
  formatEventAccessLabel,
  formatEventDayLabel,
  formatEventDayNumberLabel,
  formatEventLocationLabel,
  formatEventMonthLabel,
  formatEventPriceLabel,
  formatEventScheduleLabel,
};
