import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardMyProfileLoading() {
  return (
    <div className="flex flex-1 bg-background bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_26%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-40 rounded-full" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-80 max-w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm sm:p-8">
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Skeleton className="size-20 rounded-[1.75rem]" />
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-5 w-60" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-28 rounded-full" />
                    <Skeleton className="h-7 w-32 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] border border-border bg-muted/35 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Skeleton className="size-10 rounded-2xl" />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[72%]" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
                >
                  <Skeleton className="h-3 w-20" />
                  <div className="mt-3 flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
