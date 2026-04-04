import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import {
  CalendarRangeIcon,
  MapPinIcon,
  SparklesIcon,
  TicketIcon,
} from "lucide-react";

import { AuthAwareEventCta } from "@/components/events/auth-aware-event-cta";
import { UpcomingEventsSlider } from "@/components/home/upcoming-events-slider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicEventDetail } from "@/lib/event-contract";
import {
  formatEventAccessLabel,
  formatEventDayLabel,
  formatEventDayNumberLabel,
  formatEventLocationLabel,
  formatEventMonthLabel,
  formatEventScheduleLabel,
} from "@/lib/event-display";
import { getFeaturedEvent, getUpcomingEvents } from "@/lib/server-events-api";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute left-[-6rem] top-[-5rem] size-64 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] size-72 rounded-full bg-orange-300/15 blur-3xl" />

        <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          <Suspense fallback={<FeaturedEventHeroSkeleton />}>
            <FeaturedEventHeroSection />
          </Suspense>
        </div>
      </section>

      <section
        id="upcoming-events"
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="flex flex-col gap-3 lg:max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            Upcoming
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            See what&apos;s coming up next.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Explore upcoming events, featured sessions, and new experiences as
            they go live.
          </p>
        </div>

        <Suspense fallback={<UpcomingEventsSectionSkeleton />}>
          <UpcomingEventsSection />
        </Suspense>
      </section>
    </main>
  );
}

async function FeaturedEventHeroSection() {
  const { data: featuredEvent, errorMessage } = await getFeaturedEvent();

  if (!featuredEvent) {
    return <FeaturedEventFallback errorMessage={errorMessage} />;
  }

  return <FeaturedEventHero event={featuredEvent} />;
}

function FeaturedEventHero({ event }: { event: PublicEventDetail }) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-border bg-background/90 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-8">
        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] uppercase text-amber-800 dark:text-amber-200">
            <SparklesIcon className="size-3.5" />
            Featured event
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <InfoPill>{formatEventAccessLabel(event)}</InfoPill>
              <InfoPill>{event.locationType === "ONLINE" ? "Online" : "In person"}</InfoPill>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {event.summary ?? event.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard
              icon={<CalendarRangeIcon className="size-4" />}
              label="Schedule"
              value={formatEventScheduleLabel(event)}
            />
            <InfoCard
              icon={<MapPinIcon className="size-4" />}
              label="Location"
              value={formatEventLocationLabel(event)}
            />
            <InfoCard
              icon={<TicketIcon className="size-4" />}
              label="Hosted by"
              value={event.owner.name}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/events/${event.slug}`}>View details</Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="#upcoming-events">Browse upcoming events</Link>
            </Button>
          </div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-7">
          <div className="relative flex min-h-[21rem] h-full flex-col justify-between overflow-hidden rounded-[30px] border border-border bg-muted shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={
                event.bannerImage
                  ? { backgroundImage: `url("${event.bannerImage}")` }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/5" />

            <div className="relative flex h-full flex-col justify-between gap-6 p-6 text-white">
              <div className="self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm">
                {formatEventAccessLabel(event)}
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid w-fit grid-cols-[5rem_1fr] items-center gap-4 rounded-[28px] border border-white/15 bg-black/25 p-4 backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/15 bg-white/10 px-3 py-4 text-center">
                    <span className="text-xs font-semibold tracking-[0.24em] uppercase text-white/75">
                      {formatEventMonthLabel(event.startsAt, event.timezone)}
                    </span>
                    <span className="text-3xl font-semibold tracking-tight text-white">
                      {formatEventDayNumberLabel(event.startsAt, event.timezone)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-white/80">
                      {formatEventDayLabel(event.startsAt, event.timezone)}
                    </p>
                    <p className="text-lg font-semibold tracking-tight text-white">
                      {event.locationType === "ONLINE" ? "Live online session" : "Live venue event"}
                    </p>
                    <p className="text-sm text-white/70">
                      {formatEventLocationLabel(event)}
                    </p>
                  </div>
                </div>

                <p className="max-w-sm text-sm leading-6 text-white/80">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedEventFallback({ errorMessage }: { errorMessage: string | null }) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-border bg-background shadow-sm">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            <SparklesIcon className="size-3.5" />
            Featured event
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Featured events will appear here soon.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Check back soon for standout sessions and featured moments from
              upcoming events.
            </p>
            {errorMessage ? (
              <p className="text-sm leading-6 text-muted-foreground">
                We couldn&apos;t load the featured event right now. Please try
                again shortly.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <AuthAwareEventCta
              guestLabel="Create your account"
              authenticatedLabel="Open dashboard"
              showArrow
            />
            <Button asChild size="lg" variant="outline">
              <Link href="#upcoming-events">Browse upcoming events</Link>
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <div className="flex min-h-[21rem] h-full items-end overflow-hidden rounded-[30px] border border-border bg-linear-to-br from-muted via-background to-muted/70 p-6">
            <div className="flex max-w-sm flex-col gap-2">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Featured spotlight
              </p>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                This space is reserved for the next standout event on Meetrix.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function UpcomingEventsSection() {
  const { data: upcomingEvents, errorMessage } = await getUpcomingEvents();

  if (!upcomingEvents?.length) {
    return (
      <div className="rounded-[30px] border border-border bg-muted/40 p-6 sm:p-8">
        <div className="flex max-w-xl flex-col gap-3">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            Upcoming events will appear here soon.
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            Check back soon to discover newly published events and upcoming
            sessions.
          </p>
          {errorMessage ? (
            <p className="text-sm leading-6 text-muted-foreground">
              We couldn&apos;t load upcoming events right now. Please try again
              shortly.
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return <UpcomingEventsSlider events={upcomingEvents} />;
}

function FeaturedEventHeroSkeleton() {
  return (
    <section className="rounded-[36px] border border-border bg-background p-6 shadow-sm sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-9 w-36 rounded-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 w-full max-w-3xl rounded-3xl" />
            <Skeleton className="h-14 w-4/5 rounded-3xl" />
            <Skeleton className="h-6 w-full max-w-2xl" />
            <Skeleton className="h-6 w-2/3" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-28 rounded-[24px]" />
            <Skeleton className="h-28 rounded-[24px]" />
            <Skeleton className="h-28 rounded-[24px]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-44 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
        </div>

        <Skeleton className="min-h-[21rem] rounded-[30px]" />
      </div>
    </section>
  );
}

function UpcomingEventsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end gap-2">
        <Skeleton className="size-7 rounded-xl" />
        <Skeleton className="size-7 rounded-xl" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        <Skeleton className="h-[27rem] min-w-[24rem] rounded-[30px]" />
        <Skeleton className="hidden h-[27rem] min-w-[24rem] rounded-[30px] sm:block" />
        <Skeleton className="hidden h-[27rem] min-w-[24rem] rounded-[30px] lg:block" />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-[24px] border border-border bg-muted/35 p-4">
      <div className="inline-flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
          {label}
        </p>
        <p className="text-sm leading-6 text-foreground">{value}</p>
      </div>
    </div>
  );
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground">
      {children}
    </span>
  );
}
