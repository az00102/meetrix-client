import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const platformHighlights = [
  "Registration flows that stay organized",
  "Shared planning for teams and coordinators",
  "One place for schedules, guests, and updates",
];

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-3 ">
                <div className="size-10 rounded-2xl border border-border bg-muted object-contain p-1">
                  <Image
                    src="/brand_icon.png"
                    alt="Meetrix logo"
                    width={40}
                    height={40}
                    className=" dark:invert"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.22em] uppercase text-foreground">
                    Meetrix
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Event operations with a calmer workflow.
                  </p>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                Built to help teams plan events, manage registrations, and keep
                every moving part visible from kickoff to event day.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/register">Start with Meetrix</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:pl-10">
            <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-foreground">
              Platform
            </h2>
            <div className="flex flex-col gap-3">
              {platformHighlights.map((item) => (
                <p key={item} className="text-sm leading-6 text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>(c) {new Date().getFullYear()} Meetrix. Designed for focused event teams.</p>
          <p>Frontend on Next.js, ready to grow with your auth and event workflows.</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
