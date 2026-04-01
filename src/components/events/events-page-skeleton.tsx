import { Skeleton } from "@/components/ui/skeleton";

function EventsPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <section className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex max-w-3xl flex-col gap-4">
            <Skeleton className="h-14 w-full max-w-3xl rounded-3xl" />
            <Skeleton className="h-14 w-4/5 rounded-3xl" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8">
        <div className="rounded-[28px] border border-border/80 bg-background p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-[20px]" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/70 pt-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-40 rounded-[16px]" />
          </div>
        </div>

        <div className="grid gap-6 rounded-[32px] border border-border/80 bg-background p-6 shadow-sm lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-9 w-36 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl" />
            <Skeleton className="h-6 w-full max-w-2xl" />
            <Skeleton className="h-6 w-3/4" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20 rounded-[22px]" />
              <Skeleton className="h-20 rounded-[22px]" />
              <Skeleton className="h-20 rounded-[22px]" />
            </div>
          </div>
          <Skeleton className="min-h-[20rem] rounded-[28px]" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-sm"
            >
              <Skeleton className="h-52 rounded-none" />
              <div className="flex flex-col gap-4 p-5">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4 rounded-xl" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-2/3" />
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-8 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export { EventsPageSkeleton };
