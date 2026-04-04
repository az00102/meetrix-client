import { MyEventsPage } from "@/components/dashboard/my-events/my-events-page";
import {
  resolveMyEventsQuery,
  type ResolvedMyEventsQuery,
} from "@/lib/my-events-route";
import { getServerMyEvents } from "@/lib/server-dashboard-api";

type MyEventsPageSearchParams = Promise<{
  page?: string | string[];
  limit?: string | string[];
  sortBy?: string | string[];
  sortOrder?: string | string[];
  searchTerm?: string | string[];
  status?: string | string[];
  visibility?: string | string[];
}>;

export default async function DashboardMyEventsRoute({
  searchParams,
}: {
  searchParams: MyEventsPageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeMyEventsQuery(resolvedSearchParams);
  const initialResult = await getServerMyEvents(query);

  return <MyEventsPage initialQuery={query} initialResult={initialResult} />;
}

function normalizeMyEventsQuery(
  searchParams: Awaited<MyEventsPageSearchParams>
): ResolvedMyEventsQuery {
  return resolveMyEventsQuery({
    page: getFirstValue(searchParams.page),
    limit: getFirstValue(searchParams.limit),
    sortBy: getFirstValue(searchParams.sortBy),
    sortOrder: getFirstValue(searchParams.sortOrder),
    searchTerm: getFirstValue(searchParams.searchTerm),
    status: getFirstValue(searchParams.status),
    visibility: getFirstValue(searchParams.visibility),
  });
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
