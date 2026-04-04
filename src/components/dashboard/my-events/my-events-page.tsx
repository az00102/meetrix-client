import Link from "next/link";

import { MyEventsWorkspace } from "@/components/dashboard/my-events/my-events-workspace";
import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import type {
  AuthenticatedListResult,
  ManagedEvent,
} from "@/lib/dashboard-contract";
import type { ResolvedMyEventsQuery } from "@/lib/my-events-route";

function MyEventsPage({
  initialQuery,
  initialResult,
}: {
  initialQuery: ResolvedMyEventsQuery;
  initialResult: AuthenticatedListResult<ManagedEvent>;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Events" },
        ]}
        actions={
          <Button asChild>
            <Link href="/create-event">Create event</Link>
          </Button>
        }
      />

      <MyEventsWorkspace initialQuery={initialQuery} initialResult={initialResult} />
    </main>
  );
}

export { MyEventsPage };
