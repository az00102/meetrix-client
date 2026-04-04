import { PaymentsWorkspace } from "@/components/dashboard/payments/payments-workspace";
import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-ui";
import type {
  AuthenticatedListResult,
  PaymentRecord,
} from "@/lib/dashboard-contract";
import type { ResolvedPaymentsQuery } from "@/lib/payments-route";

function PaymentsPage({
  initialQuery,
  initialResult,
}: {
  initialQuery: ResolvedPaymentsQuery;
  initialResult: AuthenticatedListResult<PaymentRecord>;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Payments" },
        ]}
      />

      <PaymentsWorkspace initialQuery={initialQuery} initialResult={initialResult} />
    </main>
  );
}

export { PaymentsPage };
