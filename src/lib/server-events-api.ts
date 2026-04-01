import "server-only";

import type {
  ApiEnvelope,
  PublicEventCard,
  PublicEventDetail,
  PublicEventsMeta,
  PublicEventsQuery,
} from "@/lib/event-contract";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
const TRANSIENT_DATABASE_ERROR_MESSAGE = "Database request failed.";
const EVENT_REQUEST_RETRY_DELAY_MS = 180;

type ServerEventResult<T> = {
  data: T | null;
  errorMessage: string | null;
};

type ServerEventsListResult = {
  data: PublicEventCard[];
  meta: PublicEventsMeta | null;
  errorMessage: string | null;
};

async function parseApiResult<T>(response: Response) {
  return (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string }
    | null;
}

async function requestPublicEvent<T>(path: string): Promise<ServerEventResult<T>> {
  const initialResult = await requestPublicEventOnce<T>(path);

  if (!shouldRetryPublicEventRequest(initialResult.errorMessage)) {
    return initialResult;
  }

  await wait(EVENT_REQUEST_RETRY_DELAY_MS);
  return requestPublicEventOnce<T>(path);
}

async function getFeaturedEvent() {
  return requestPublicEvent<PublicEventDetail | null>("/events/featured");
}

async function getUpcomingEvents(limit = 8) {
  return requestPublicEvent<PublicEventCard[]>(
    `/events/upcoming?limit=${encodeURIComponent(String(limit))}`
  );
}

function buildPublicEventsQueryString(query: PublicEventsQuery) {
  const searchParams = new URLSearchParams();

  if (query.searchTerm) {
    searchParams.set("searchTerm", query.searchTerm);
  }

  if (query.page) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit) {
    searchParams.set("limit", String(query.limit));
  }

  if (query.sortBy) {
    searchParams.set("sortBy", query.sortBy);
  }

  if (query.sortOrder) {
    searchParams.set("sortOrder", query.sortOrder);
  }

  if (query.pricingType) {
    searchParams.set("pricingType", query.pricingType);
  }

  if (query.locationType) {
    searchParams.set("locationType", query.locationType);
  }

  const result = searchParams.toString();
  return result ? `?${result}` : "";
}

async function getPublicEvents(query: PublicEventsQuery): Promise<ServerEventsListResult> {
  const initialResult = await requestPublicEventsOnce(query);

  if (!shouldRetryPublicEventRequest(initialResult.errorMessage)) {
    return initialResult;
  }

  await wait(EVENT_REQUEST_RETRY_DELAY_MS);
  return requestPublicEventsOnce(query);
}

function isPublicEventsMeta(value: unknown): value is PublicEventsMeta {
  return (
    typeof value === "object" &&
    value !== null &&
    "page" in value &&
    "limit" in value &&
    "total" in value &&
    "totalPages" in value
  );
}

async function requestPublicEventOnce<T>(path: string): Promise<ServerEventResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await parseApiResult<T>(response);

    if (!response.ok || !result || !("success" in result) || !result.success) {
      return {
        data: null,
        errorMessage: result?.message ?? "Unable to load live event data right now.",
      };
    }

    return {
      data: result.data,
      errorMessage: null,
    };
  } catch {
    return {
      data: null,
      errorMessage: "The event service is currently unavailable.",
    };
  }
}

async function requestPublicEventsOnce(
  query: PublicEventsQuery
): Promise<ServerEventsListResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events${buildPublicEventsQueryString(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await parseApiResult<PublicEventCard[]>(response);

    if (!response.ok || !result || !("success" in result) || !result.success) {
      return {
        data: [],
        meta: null,
        errorMessage: result?.message ?? "Unable to load the events list right now.",
      };
    }

    return {
      data: result.data,
      meta: isPublicEventsMeta(result.meta) ? result.meta : null,
      errorMessage: null,
    };
  } catch {
    return {
      data: [],
      meta: null,
      errorMessage: "The event service is currently unavailable.",
    };
  }
}

function shouldRetryPublicEventRequest(errorMessage: string | null) {
  return (
    errorMessage === TRANSIENT_DATABASE_ERROR_MESSAGE ||
    errorMessage === "The event service is currently unavailable."
  );
}

function wait(durationMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export { getFeaturedEvent, getPublicEvents, getUpcomingEvents };
