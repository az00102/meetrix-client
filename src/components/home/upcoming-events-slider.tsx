"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
} from "lucide-react";

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
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(events.length > 1);

  const syncScrollState = React.useEffectEvent(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const maxLeft = track.scrollWidth - track.clientWidth;

    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft < maxLeft - 8);
  });

  React.useEffect(() => {
    syncScrollState();

    const track = trackRef.current;

    if (!track) {
      return;
    }

    const handleScroll = () => {
      syncScrollState();
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [events.length]);

  function scrollByPage(direction: "next" | "previous") {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const distance = Math.max(track.clientWidth * 0.86, 280);
    const offset = direction === "next" ? distance : -distance;

    track.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => scrollByPage("previous")}
          disabled={!canScrollLeft}
          aria-label="Show previous upcoming events"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => scrollByPage("next")}
          disabled={!canScrollRight}
          aria-label="Show more upcoming events"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <article
            key={event.id}
            className="flex min-w-[calc(100%-0.5rem)] snap-start flex-col overflow-hidden rounded-[30px] border border-border bg-background shadow-sm sm:min-w-[24rem] lg:min-w-[25rem]"
          >
            <div className="relative h-48 overflow-hidden border-b border-border bg-muted">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={
                  event.bannerImage
                    ? { backgroundImage: `url("${event.bannerImage}")` }
                    : undefined
                }
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
              <div className="relative flex h-full flex-col justify-between p-5 text-white">
                <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase backdrop-blur-sm">
                  {formatEventAccessLabel(event)}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold tracking-tight">{event.title}</h3>
                  <p className="text-sm text-white/80">{event.owner.name}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="flex flex-col gap-2 rounded-[24px] border border-border bg-muted/40 p-4">
                <div className="flex items-start gap-2 text-sm text-foreground">
                  <CalendarRangeIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <span>{formatEventScheduleLabel(event)}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="mt-0.5 size-4" />
                  <span>{formatEventLocationLabel(event)}</span>
                </div>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {event.summary ??
                  "Fresh event details are available live from the platform right now."}
              </p>

              <div className="mt-auto flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                    Hosted by
                  </p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {event.owner.name}
                  </p>
                </div>

                {event.eventLink ? (
                  <Button asChild size="sm">
                    <a href={event.eventLink} target="_blank" rel="noreferrer">
                      Open link
                      <ArrowRightIcon data-icon="inline-end" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/register">
                      Join Meetrix
                      <ArrowRightIcon data-icon="inline-end" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export { UpcomingEventsSlider };
