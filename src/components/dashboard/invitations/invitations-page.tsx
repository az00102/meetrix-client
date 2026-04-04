import { InvitationsWorkspace } from "@/components/dashboard/invitations/invitations-workspace";
import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-ui";
import type {
  AuthenticatedListResult,
  InvitationRecord,
  ManagedEvent,
} from "@/lib/dashboard-contract";
import type { ResolvedInvitationsQuery } from "@/lib/invitations-route";

function InvitationsPage({
  initialQuery,
  initialResult,
  initialEventFilterOptions,
}: {
  initialQuery: ResolvedInvitationsQuery;
  initialResult: AuthenticatedListResult<InvitationRecord>;
  initialEventFilterOptions: AuthenticatedListResult<ManagedEvent> | null;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invitations" },
        ]}
      />

      <InvitationsWorkspace
        initialQuery={initialQuery}
        initialResult={initialResult}
        initialEventFilterOptions={initialEventFilterOptions}
      />
    </main>
  );
}

export { InvitationsPage };
