import { notFound } from "next/navigation";

import { EditEventPage } from "@/components/dashboard/edit-event-page";
import { getServerManagedEventById } from "@/lib/server-dashboard-api";

type EditManagedEventPageParams = Promise<{
  id: string;
}>;

export default async function DashboardEditManagedEventRoute({
  params,
}: {
  params: EditManagedEventPageParams;
}) {
  const { id } = await params;
  const eventResult = await getServerManagedEventById(id);

  if (eventResult.errorStatus === 404) {
    notFound();
  }

  return <EditEventPage eventResult={eventResult} />;
}
