import { EventsPage } from "@/components/events/events-page";
import {
  DEFAULT_EVENTS_PAGE,
  resolveEventsQuery,
  type ResolvedPublicEventsQuery,
} from "@/lib/events-route";
import { getFeaturedEvent, getPublicEvents } from "@/lib/server-events-api";

type EventsPageSearchParams = Promise<{
  searchTerm?: string | string[];
  page?: string | string[];
  limit?: string | string[];
  sortBy?: string | string[];
  sortOrder?: string | string[];
  pricingType?: string | string[];
  locationType?: string | string[];
}>;

export default async function EventsRoute({
  searchParams,
}: {
  searchParams: EventsPageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeEventsQuery(resolvedSearchParams);
  const shouldLoadFeaturedEvent =
    !query.searchTerm &&
    !query.pricingType &&
    !query.locationType &&
    query.page === DEFAULT_EVENTS_PAGE;
  const [eventsResult, featuredEventResult] = await Promise.all([
    getPublicEvents(query),
    shouldLoadFeaturedEvent
      ? getFeaturedEvent()
      : Promise.resolve({ data: null, errorMessage: null }),
  ]);

  return (
    <EventsPage
      query={query}
      events={eventsResult.data}
      meta={eventsResult.meta}
      errorMessage={eventsResult.errorMessage}
      featuredEvent={featuredEventResult.data}
    />
  );
}

function normalizeEventsQuery(
  searchParams: Awaited<EventsPageSearchParams>
): ResolvedPublicEventsQuery {
  return resolveEventsQuery({
    searchTerm: getFirstValue(searchParams.searchTerm),
    page: getFirstValue(searchParams.page),
    limit: getFirstValue(searchParams.limit),
    sortBy: getFirstValue(searchParams.sortBy),
    sortOrder: getFirstValue(searchParams.sortOrder),
    pricingType: getFirstValue(searchParams.pricingType),
    locationType: getFirstValue(searchParams.locationType),
  });
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
