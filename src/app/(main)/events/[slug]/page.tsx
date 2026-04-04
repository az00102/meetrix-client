import { notFound } from "next/navigation";
import { CalendarRangeIcon, MapPinIcon, TicketIcon } from "lucide-react";

import { EventDetailActions } from "@/components/events/event-detail-actions";
import { Button } from "@/components/ui/button";
import {
  formatEventAccessLabel,
  formatEventLocationLabel,
  formatEventScheduleLabel,
} from "@/lib/event-display";
import {
  getPublicEventAccessState,
  getPublicEventBySlug,
} from "@/lib/server-events-api";

type EventDetailsParams = Promise<{
  slug: string;
}>;

export default async function EventDetailsRoute({
  params,
}: {
  params: EventDetailsParams;
}) {
  const { slug } = await params;
  const [result, accessStateResult] = await Promise.all([
    getPublicEventBySlug(slug),
    getPublicEventAccessState(slug),
  ]);

  if (result.errorStatus === 404) {
    notFound();
  }

  if (!result.data) {
    return (
      <main className="flex flex-1 bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="flex max-w-2xl flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                We couldn&apos;t load this event
              </h1>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                {result.errorMessage ?? "Please try again in a moment."}
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const event = result.data;

  return (
    <main className="flex flex-1 bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-sm lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-2">
              <Tag>{formatEventAccessLabel(event)}</Tag>
              <Tag>{event.locationType === "ONLINE" ? "Online" : "In person"}</Tag>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {event.title}
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                {event.summary ?? event.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DetailCard
                icon={<CalendarRangeIcon className="size-4" />}
                label="Schedule"
                value={formatEventScheduleLabel(event)}
              />
              <DetailCard
                icon={<MapPinIcon className="size-4" />}
                label="Location"
                value={formatEventLocationLabel(event)}
              />
              <DetailCard
                icon={<TicketIcon className="size-4" />}
                label="Hosted by"
                value={event.owner.name}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <EventDetailActions
                event={event}
                accessState={accessStateResult.data}
                accessStateErrorMessage={accessStateResult.errorMessage}
              />
              <Button asChild size="lg" variant="outline">
                <a href="#event-description">Read details</a>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[20rem] border-t border-border bg-muted lg:border-l lg:border-t-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={
                event.bannerImage
                  ? { backgroundImage: `url("${event.bannerImage}")` }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10" />
            <div className="relative flex h-full items-end p-6 sm:p-8">
              <div className="max-w-md rounded-[1.75rem] border border-white/15 bg-black/25 p-5 text-white backdrop-blur-sm">
                <p className="text-sm text-white/70">Hosted by {event.owner.name}</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-white">
                  {formatEventScheduleLabel(event)}
                </p>
                <p className="mt-1 text-sm leading-6 text-white/75">
                  {formatEventLocationLabel(event)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="event-description"
          className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
        >
          <article className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Event description
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                {event.description}
              </p>
            </div>
          </article>

          <aside className="grid gap-4">
            <AsideItem label="Visibility" value={event.visibility} />
            <AsideItem label="Capacity" value={event.capacity ? `${event.capacity}` : "No limit"} />
            <AsideItem label="Published" value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(event.createdAt))} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-muted/35 p-4">
      <div className="flex items-start gap-3">
        <div className="inline-flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-sm leading-6 text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function AsideItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-medium text-foreground">{value}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground">
      {children}
    </span>
  );
}
