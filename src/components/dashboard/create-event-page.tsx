import Link from "next/link";

import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-ui";
import { CreateEventWorkspace } from "@/components/dashboard/my-events/create-event-workspace";
import { Button } from "@/components/ui/button";

function CreateEventPage() {
  return (
    <main className="flex flex-1 bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DashboardBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Create Event" },
          ]}
          actions={
            <Button asChild variant="outline">
              <Link href="/dashboard/my-events">My events</Link>
            </Button>
          }
        />

        <CreateEventWorkspace />
      </div>
    </main>
  );
}

export { CreateEventPage };
