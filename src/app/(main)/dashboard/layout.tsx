import { connection } from "next/server";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { QueryProvider } from "@/components/shared/query-provider";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  await connection();

  return (
    <QueryProvider>
      <div className="flex flex-1 bg-background">
        <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
          <DashboardSidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </QueryProvider>
  );
}
