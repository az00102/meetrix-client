import { formatEventPriceLabel } from "@/lib/event-display";

function formatDashboardEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatDashboardDate(
  value: string | null,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
  }
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function formatDashboardDateTime(value: string | null) {
  return formatDashboardDate(value, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDashboardPricing({
  pricingType,
  registrationFee,
  currency,
}: {
  pricingType: "FREE" | "PAID";
  registrationFee: number;
  currency: string;
}) {
  return formatEventPriceLabel({
    pricingType,
    registrationFee,
    currency,
  });
}

function formatDashboardMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export {
  formatDashboardDate,
  formatDashboardDateTime,
  formatDashboardEnum,
  formatDashboardMoney,
  formatDashboardPricing,
};
