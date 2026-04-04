import { PaymentsPage } from "@/components/dashboard/payments/payments-page";
import {
  resolvePaymentsQuery,
  type ResolvedPaymentsQuery,
} from "@/lib/payments-route";
import { getServerMyPayments } from "@/lib/server-dashboard-api";

type PaymentsPageSearchParams = Promise<{
  page?: string | string[];
  limit?: string | string[];
  sortBy?: string | string[];
  sortOrder?: string | string[];
  searchTerm?: string | string[];
  status?: string | string[];
  purpose?: string | string[];
}>;

export default async function DashboardPaymentsRoute({
  searchParams,
}: {
  searchParams: PaymentsPageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizePaymentsQuery(resolvedSearchParams);
  const initialResult = await getServerMyPayments(query);

  return <PaymentsPage initialQuery={query} initialResult={initialResult} />;
}

function normalizePaymentsQuery(
  searchParams: Awaited<PaymentsPageSearchParams>
): ResolvedPaymentsQuery {
  return resolvePaymentsQuery({
    page: getFirstValue(searchParams.page),
    limit: getFirstValue(searchParams.limit),
    sortBy: getFirstValue(searchParams.sortBy),
    sortOrder: getFirstValue(searchParams.sortOrder),
    searchTerm: getFirstValue(searchParams.searchTerm),
    status: getFirstValue(searchParams.status),
    purpose: getFirstValue(searchParams.purpose),
  });
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
