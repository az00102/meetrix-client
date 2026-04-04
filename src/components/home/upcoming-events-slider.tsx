"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CalendarRangeIcon, MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicEventCard } from "@/lib/event-contract";
import {
  formatEventAccessLabel,
  formatEventLocationLabel,
  formatEventScheduleLabel,
} from "@/lib/event-display";

type UpcomingEventsSliderProps = {
  events: PublicEventCard[];
};

function UpcomingEventsSlider({ events }: UpcomingEventsSliderProps) {
  if (events.length === 0) {
    return null;
  }

  if (events.length === 1) {
    return (
      <div className="flex justify-center">
        <UpcomingEventCard event={events[0]} />
      </div>
    );
  }

  const animationStyle = {
    "--upcoming-marquee-duration": `${Math.max(28, events.length * 8)}s`,
  } as CSSProperties;

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-background via-background/80 to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-background via-background/80 to-transparent sm:w-16" />

      <div
        className="upcoming-marquee-shell overflow-hidden py-1"
        style={animationStyle}
      >
        <div className="upcoming-marquee-track flex w-max">
          <div className="upcoming-marquee-copy flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4">
            {events.map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))}
          </div>

          <div
            className="upcoming-marquee-copy flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4"
            aria-hidden="true"
            data-duplicate="true"
          >
            {events.map((event) => (
              <UpcomingEventCard key={`${event.id}-duplicate`} event={event} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .upcoming-marquee-track {
          animation: upcoming-marquee var(--upcoming-marquee-duration) linear infinite;
          will-change: transform;
        }

        .group:hover .upcoming-marquee-track,
        .group:focus-within .upcoming-marquee-track {
          animation-play-state: paused;
        }

        @media (max-width: 639px) {
          .upcoming-marquee-track {
            animation-duration: calc(var(--upcoming-marquee-duration) * 1.2);
          }
        }

        @keyframes upcoming-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .upcoming-marquee-shell {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .upcoming-marquee-shell::-webkit-scrollbar {
            display: none;
          }

          .upcoming-marquee-track {
            animation: none;
          }

          .upcoming-marquee-copy[data-duplicate="true"] {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function UpcomingEventCard({ event }: { event: PublicEventCard }) {
  return (
    <article className="flex w-[84vw] max-w-[20rem] shrink-0 flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-sm sm:w-[22rem] sm:max-w-[22rem] sm:rounded-[30px] lg:w-[25rem] lg:max-w-[25rem]">
      <div className="relative h-44 overflow-hidden border-b border-border bg-muted sm:h-48">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            event.bannerImage
              ? { backgroundImage: `url("${event.bannerImage}")` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
          <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur-sm sm:text-[11px] sm:tracking-[0.18em]">
            {formatEventAccessLabel(event)}
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight sm:text-xl">
              {event.title}
            </h3>
            <p className="truncate text-sm text-white/80">{event.owner.name}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="flex flex-col gap-2 rounded-[22px] border border-border bg-muted/40 p-3.5 sm:rounded-[24px] sm:p-4">
          <div className="flex items-start gap-2 text-sm text-foreground">
            <CalendarRangeIcon className="mt-0.5 size-4 text-muted-foreground" />
            <span className="min-w-0 leading-6">{formatEventScheduleLabel(event)}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="mt-0.5 size-4" />
            <span className="min-w-0 leading-6">{formatEventLocationLabel(event)}</span>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {event.summary ??
            "Fresh event details are available live from the platform right now."}
        </p>

        <div className="mt-auto flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Hosted by
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {event.owner.name}
            </p>
          </div>

          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href={`/events/${event.slug}`}>View details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export { UpcomingEventsSlider };
