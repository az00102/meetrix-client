import Link from "next/link";

import {
  DashboardBreadcrumbs,
  DashboardErrorState,
} from "@/components/dashboard/dashboard-ui";
import { EditEventWorkspace } from "@/components/dashboard/my-events/edit-event-workspace";
import { Button } from "@/components/ui/button";
import type {
  AuthenticatedItemResult,
  ManagedEvent,
} from "@/lib/dashboard-contract";

function EditEventPage({
  eventResult,
}: {
  eventResult: AuthenticatedItemResult<ManagedEvent>;
}) {
  const event = eventResult.data;

  if (!event) {
    return (
      <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
        <DashboardBreadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Events", href: "/dashboard/my-events" },
            { label: "Edit Event" },
          ]}
        />
        <DashboardErrorState
          title={
            eventResult.errorStatus === 401
              ? "Sign in to edit this event"
              : "We couldn't load this event"
          }
          description={
            eventResult.errorMessage ?? "Please try again in a moment."
          }
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Events", href: "/dashboard/my-events" },
          {
            label: event.title,
            href: `/dashboard/my-events/${event.id}`,
          },
          { label: "Edit" },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href={`/dashboard/my-events/${event.id}`}>
              Manage event
            </Link>
          </Button>
        }
      />

      <EditEventWorkspace event={event} />
    </main>
  );
}

export { EditEventPage };
