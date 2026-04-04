import type {
  ApiEnvelope,
  PublicEventCard,
  PublicEventsMeta,
  PublicEventsQuery,
} from "@/lib/event-contract";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
const TRANSIENT_DATABASE_ERROR_MESSAGE = "Database request failed.";
const EVENT_REQUEST_RETRY_DELAY_MS = 180;

type ClientEventsListResult = {
  data: PublicEventCard[];
  meta: PublicEventsMeta | null;
  errorMessage: string | null;
};

async function getClientPublicEvents(
  query: PublicEventsQuery,
  signal?: AbortSignal
): Promise<ClientEventsListResult> {
  const initialResult = await requestPublicEventsOnce(query, signal);

  if (!shouldRetryPublicEventRequest(initialResult.errorMessage) || signal?.aborted) {
    return initialResult;
  }

  await wait(EVENT_REQUEST_RETRY_DELAY_MS);

  if (signal?.aborted) {
    return initialResult;
  }

  return requestPublicEventsOnce(query, signal);
}

async function requestPublicEventsOnce(
  query: PublicEventsQuery,
  signal?: AbortSignal
): Promise<ClientEventsListResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events${buildPublicEventsQueryString(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal,
      }
    );

    const result = (await response.json().catch(() => null)) as
      | ApiEnvelope<PublicEventCard[]>
      | { message?: string }
      | null;

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
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return {
      data: [],
      meta: null,
      errorMessage: "The event service is currently unavailable.",
    };
  }
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

export { getClientPublicEvents };
export type { ClientEventsListResult };
