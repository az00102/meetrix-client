import type { ResolvedMyEventsQuery } from "@/lib/my-events-route";

const INVITATION_EVENT_FILTER_QUERY = {
  page: 1,
  limit: 50,
  sortBy: "updatedAt",
  sortOrder: "desc",
} satisfies ResolvedMyEventsQuery;

export { INVITATION_EVENT_FILTER_QUERY };
