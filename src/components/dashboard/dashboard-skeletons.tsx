import { Skeleton } from "@/components/ui/skeleton";

function DashboardListPageSkeleton({
  filterCount = 3,
  columnCount = 6,
  cardCount = 3,
}: {
  filterCount?: number;
  columnCount?: number;
  cardCount?: number;
}) {
  const tableGridTemplate = buildTableGridTemplate(columnCount);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>

      <section className="rounded-md border border-border/80 bg-card p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))]">
          <Skeleton className="h-11 w-full rounded-xl" />
          {Array.from({ length: filterCount }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-11 w-full rounded-xl"
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1040px]">
            <div
              className="grid gap-4 border-b border-border px-5 py-4"
              style={{ gridTemplateColumns: tableGridTemplate }}
            >
              {Array.from({ length: columnCount }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-20" />
              ))}
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: cardCount }).map((_, index) => (
                <div
                  key={index}
                  className="grid gap-4 px-5 py-4"
                  style={{ gridTemplateColumns: tableGridTemplate }}
                >
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48 max-w-full" />
                    <Skeleton className="h-4 w-32 max-w-full" />
                  </div>
                  {Array.from({ length: Math.max(columnCount - 2, 0) }).map((__, cellIndex) => (
                    <div key={cellIndex} className="space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-10 rounded-xl" />
            <Skeleton className="h-9 w-10 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      </section>
    </main>
  );
}

function buildTableGridTemplate(columnCount: number) {
  if (columnCount <= 1) {
    return "minmax(16rem, 1fr)";
  }

  if (columnCount === 2) {
    return "minmax(16rem, 2.2fr) minmax(8rem, 0.95fr)";
  }

  return `minmax(16rem, 2.2fr) repeat(${columnCount - 2}, minmax(8rem, 1fr)) minmax(8rem, 0.95fr)`;
}

function DashboardWorkspaceSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-36" />
      </div>

      <section className="rounded-md border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32 max-w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export { DashboardListPageSkeleton, DashboardWorkspaceSkeleton };
