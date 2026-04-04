import { ParticipationsWorkspace } from "@/components/dashboard/participations/participations-workspace";
import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-ui";
import type {
  AuthenticatedListResult,
  ParticipationRecord,
} from "@/lib/dashboard-contract";
import type { ResolvedParticipationsQuery } from "@/lib/participations-route";

function ParticipationsPage({
  initialQuery,
  initialResult,
}: {
  initialQuery: ResolvedParticipationsQuery;
  initialResult: AuthenticatedListResult<ParticipationRecord>;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Participations" },
        ]}
      />

      <ParticipationsWorkspace
        initialQuery={initialQuery}
        initialResult={initialResult}
      />
    </main>
  );
}

export { ParticipationsPage };
