import { ParticipationsPage } from "@/components/dashboard/participations/participations-page";
import {
  resolveParticipationsQuery,
  type ResolvedParticipationsQuery,
} from "@/lib/participations-route";
import { getServerMyParticipations } from "@/lib/server-dashboard-api";

type ParticipationsPageSearchParams = Promise<{
  page?: string | string[];
  limit?: string | string[];
  sortBy?: string | string[];
  sortOrder?: string | string[];
  searchTerm?: string | string[];
  status?: string | string[];
  joinType?: string | string[];
}>;

export default async function DashboardParticipationsRoute({
  searchParams,
}: {
  searchParams: ParticipationsPageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeParticipationsQuery(resolvedSearchParams);
  const initialResult = await getServerMyParticipations(query);

  return (
    <ParticipationsPage initialQuery={query} initialResult={initialResult} />
  );
}

function normalizeParticipationsQuery(
  searchParams: Awaited<ParticipationsPageSearchParams>
): ResolvedParticipationsQuery {
  return resolveParticipationsQuery({
    page: getFirstValue(searchParams.page),
    limit: getFirstValue(searchParams.limit),
    sortBy: getFirstValue(searchParams.sortBy),
    sortOrder: getFirstValue(searchParams.sortOrder),
    searchTerm: getFirstValue(searchParams.searchTerm),
    status: getFirstValue(searchParams.status),
    joinType: getFirstValue(searchParams.joinType),
  });
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
