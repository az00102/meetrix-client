"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpIcon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  SparklesIcon,
  TicketIcon,
} from "lucide-react";

import { EventsControls } from "@/components/events/events-controls";
import { Button } from "@/components/ui/button";
import { getClientPublicEvents } from "@/lib/client-events-api";
import type {
  PublicEventCard,
  PublicEventDetail,
  PublicEventsMeta,
} from "@/lib/event-contract";
import {
  buildEventsHref,
  resolveEventsQueryFromSearchParams,
  type ResolvedPublicEventsQuery,
} from "@/lib/events-route";
import {
  formatEventDayLabel,
  formatEventDayNumberLabel,
  formatEventLocationLabel,
  formatEventMonthLabel,
  formatEventPriceLabel,
  formatEventScheduleLabel,
} from "@/lib/event-display";

type EventsPageProps = {
  query: ResolvedPublicEventsQuery;
  events: PublicEventCard[];
  meta: PublicEventsMeta | null;
  errorMessage: string | null;
  featuredEvent: PublicEventDetail | null;
};

type EventsViewState = {
  queryHref: string;
  events: PublicEventCard[];
  meta: PublicEventsMeta | null;
  errorMessage: string | null;
};

function EventsPage({
  query: initialQuery,
  events: initialEvents,
  meta: initialMeta,
  errorMessage: initialErrorMessage,
  featuredEvent,
}: EventsPageProps) {
  const searchParams = useSearchParams();
  const activeQuery = resolveEventsQueryFromSearchParams(searchParams);
  const activeQueryHref = buildEventsHref(activeQuery);
  const [viewState, setViewState] = React.useState<EventsViewState>(() => ({
    queryHref: buildEventsHref(initialQuery),
    events: initialEvents,
    meta: initialMeta,
    errorMessage: initialErrorMessage,
  }));
  const [isFetching, setIsFetching] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 320);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  React.useEffect(() => {
    if (viewState.queryHref === activeQueryHref) {
      return;
    }

    const nextQuery = resolveEventsQueryFromSearchParams(searchParams);
    const controller = new AbortController();
    setIsFetching(true);

    void getClientPublicEvents(nextQuery, controller.signal)
      .then((result) => {
        startTransition(() => {
          setViewState({
            queryHref: activeQueryHref,
            events: result.data,
            meta: result.meta,
            errorMessage: result.errorMessage,
          });
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        startTransition(() => {
          setViewState({
            queryHref: activeQueryHref,
            events: [],
            meta: null,
            errorMessage: "Unable to load the events list right now.",
          });
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [activeQueryHref, searchParams, startTransition, viewState.queryHref]);

  const resultCount = viewState.meta?.total ?? viewState.events.length;
  const pageCount = viewState.meta?.totalPages ?? 0;
  const isDefaultView =
    !activeQuery.searchTerm &&
    !activeQuery.pricingType &&
    !activeQuery.locationType &&
    activeQuery.page === 1;
  const shouldShowFeaturedEvent =
    Boolean(featuredEvent) &&
    isDefaultView &&
    !viewState.events.some((event) => event.id === featuredEvent?.id);

  function updateQuery(nextQuery: ResolvedPublicEventsQuery) {
    const nextHref = buildEventsHref(nextQuery);

    if (nextHref === activeQueryHref) {
      return;
    }

    window.history.pushState(null, "", nextHref);
  }

  function resetFilters() {
    updateQuery({
      ...activeQuery,
      searchTerm: undefined,
      pricingType: undefined,
      locationType: undefined,
      page: 1,
    });
  }

  function retryCurrentQuery() {
    setViewState((currentState) => ({
      ...currentState,
      queryHref: "",
    }));
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <main className="flex flex-1 flex-col bg-muted/20">
        <section className="relative overflow-hidden border-b border-border/70 bg-linear-to-b from-background via-background to-muted/40">
          <div className="absolute left-[-5rem] top-[-4rem] size-52 rounded-full bg-muted blur-3xl" />
          <div className="absolute right-[-4rem] top-10 size-64 rounded-full bg-secondary/80 blur-3xl" />

          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex max-w-3xl flex-col gap-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Discover events worth showing up for.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Browse public sessions, workshops, and community meetups in one
                calm, searchable feed.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8">
          <EventsControls
            query={activeQuery}
            totalResults={resultCount}
            totalPages={pageCount}
            currentPage={activeQuery.page}
            isPending={isFetching}
            onQueryChange={updateQuery}
          />

          {viewState.errorMessage ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {viewState.errorMessage}
            </p>
          ) : null}

          {shouldShowFeaturedEvent && featuredEvent ? (
            <FeaturedEventSection event={featuredEvent} />
          ) : null}

          {viewState.events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {viewState.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EventsEmptyState
              hasError={Boolean(viewState.errorMessage)}
              hasFilters={Boolean(
                activeQuery.searchTerm ||
                  activeQuery.pricingType ||
                  activeQuery.locationType
              )}
              onReset={resetFilters}
              onRetry={retryCurrentQuery}
            />
          )}

          {viewState.meta ? (
            <EventsPagination
              meta={viewState.meta}
              pageCount={pageCount}
              isPending={isFetching}
              onPageChange={(page) => {
                updateQuery({
                  ...activeQuery,
                  page,
                });
              }}
            />
          ) : null}
        </section>
      </main>

      {showBackToTop ? (
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
          aria-label="Back to top"
        >
          <ArrowUpIcon />
        </Button>
      ) : null}
    </>
  );
}

function FeaturedEventSection({ event }: { event: PublicEventDetail }) {
  return (
    <section className="grid gap-6 overflow-hidden rounded-[32px] border border-border/80 bg-background p-6 shadow-sm lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:p-7">
      <div className="flex flex-col gap-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground">
          <SparklesIcon className="size-4" />
          Featured event
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <FilterTag>{formatEventPriceLabel(event)}</FilterTag>
            <FilterTag>
              {event.locationType === "ONLINE" ? "Online" : "In person"}
            </FilterTag>
            {event.requiresApproval ? (
              <FilterTag>Approval required</FilterTag>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {event.title}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {event.summary ?? event.description}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetadataCard
            icon={<CalendarRangeIcon className="size-4" />}
            text={formatEventScheduleLabel(event)}
          />
          <MetadataCard
            icon={<MapPinIcon className="size-4" />}
            text={formatEventLocationLabel(event)}
          />
          <MetadataCard
            icon={<TicketIcon className="size-4" />}
            text={event.owner.name}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`/events/${event.slug}`}>View details</Link>
          </Button>
        </div>
      </div>

      <div className="relative min-h-[20rem] overflow-hidden rounded-[28px] border border-border bg-muted shadow-sm">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            event.bannerImage
              ? { backgroundImage: `url("${event.bannerImage}")` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/5" />

        <div className="relative flex h-full flex-col justify-between gap-6 p-6 text-white">
          <div className="self-start rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            Hosted by {event.owner.name}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid w-fit grid-cols-[5rem_1fr] items-center gap-4 rounded-[24px] border border-white/15 bg-black/25 p-4 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-white/15 bg-white/10 px-3 py-4 text-center">
                <span className="text-sm font-medium text-white/75">
                  {formatEventMonthLabel(event.startsAt, event.timezone)}
                </span>
                <span className="text-3xl font-semibold tracking-tight text-white">
                  {formatEventDayNumberLabel(event.startsAt, event.timezone)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-white/75">
                  {formatEventDayLabel(event.startsAt, event.timezone)}
                </p>
                <p className="text-lg font-semibold tracking-tight text-white">
                  {event.locationType === "ONLINE"
                    ? "Live online session"
                    : "Live venue event"}
                </p>
                <p className="text-sm text-white/75">
                  {formatEventLocationLabel(event)}
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-white/80">
              {event.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: PublicEventCard }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-52 overflow-hidden bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
          style={
            event.bannerImage
              ? { backgroundImage: `url("${event.bannerImage}")` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        <div className="relative flex h-full items-start justify-between gap-3 p-5 text-white">
          <div className="flex flex-wrap gap-2">
            <OverlayTag>{formatEventPriceLabel(event)}</OverlayTag>
            <OverlayTag>
              {event.locationType === "ONLINE" ? "Online" : "In person"}
            </OverlayTag>
          </div>

          <div className="flex flex-col items-center rounded-[20px] border border-white/15 bg-black/25 px-3 py-2.5 text-center backdrop-blur-sm">
            <span className="text-xs font-medium text-white/70">
              {formatEventMonthLabel(event.startsAt, event.timezone)}
            </span>
            <span className="text-2xl font-semibold tracking-tight text-white">
              {formatEventDayNumberLabel(event.startsAt, event.timezone)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {event.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {event.summary ??
              "Event details will be available here as soon as the organizer adds a short summary."}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <MetadataRow
            icon={<CalendarRangeIcon className="size-4" />}
            text={formatEventScheduleLabel(event)}
          />
          <MetadataRow
            icon={<MapPinIcon className="size-4" />}
            text={formatEventLocationLabel(event)}
          />
          <MetadataRow
            icon={<TicketIcon className="size-4" />}
            text={event.owner.name}
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {event.requiresApproval ? "Approval required" : "Open registration"}
          </p>

          <Button asChild size="sm">
            <Link href={`/events/${event.slug}`}>View details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function EventsEmptyState({
  hasError,
  hasFilters,
  onReset,
  onRetry,
}: {
  hasError: boolean;
  hasFilters: boolean;
  onReset: () => void;
  onRetry: () => void;
}) {
  const primaryAction = hasError ? onRetry : hasFilters ? onReset : onRetry;
  const primaryLabel = hasError ? "Retry" : hasFilters ? "Clear filters" : "Retry";

  return (
    <div className="rounded-[28px] border border-border/80 bg-background p-8 shadow-sm">
      <div className="flex max-w-xl flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {hasError ? "We couldn't load events right now." : "No events matched this view."}
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          {hasError
            ? "Please try reloading in a moment. The events service may be catching up."
            : "Try a broader search or clear the active filters to see more events."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={primaryAction}>
            {primaryLabel}
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventsPagination({
  meta,
  pageCount,
  isPending,
  onPageChange,
}: {
  meta: PublicEventsMeta;
  pageCount: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = buildPaginationRange(meta.page, pageCount);

  return (
    <nav className="flex flex-col gap-4 rounded-[28px] border border-border/80 bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {pageCount}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1 || isPending}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>

        {pages.map((pageNumber) =>
          pageNumber === meta.page ? (
            <Button key={pageNumber} size="sm" variant="secondary" disabled>
              {pageNumber}
            </Button>
          ) : (
            <Button
              key={pageNumber}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onPageChange(pageNumber)}
              disabled={isPending}
            >
              {pageNumber}
            </Button>
          )
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= pageCount || isPending}
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}

function MetadataCard({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex min-h-20 items-start gap-3 rounded-[22px] border border-border bg-muted/40 p-4">
      <div className="inline-flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
        {icon}
      </div>
      <p className="text-sm leading-6 text-foreground">{text}</p>
    </div>
  );
}

function MetadataRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="min-w-0 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function FilterTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-sm font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function OverlayTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
      {children}
    </span>
  );
}

function buildPaginationRange(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index
  );
}

export { EventsPage };
