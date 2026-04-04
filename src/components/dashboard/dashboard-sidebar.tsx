"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  CalendarRangeIcon,
  CreditCardIcon,
  HouseIcon,
  LayoutDashboardIcon,
  MailIcon,
  Menu,
  UsersRoundIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import { getMyInvitations } from "@/lib/invitation-api";
import { getMyEvents } from "@/lib/managed-events-api";
import { resolveMyEventsQuery } from "@/lib/my-events-route";
import { getMyPayments } from "@/lib/payment-api";
import { resolvePaymentsQuery } from "@/lib/payments-route";
import { getMyParticipations } from "@/lib/participation-api";
import { resolveParticipationsQuery } from "@/lib/participations-route";
import { resolveInvitationsQuery } from "@/lib/invitations-route";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const DEFAULT_MY_EVENTS_QUERY = resolveMyEventsQuery({});
const DEFAULT_PARTICIPATIONS_QUERY = resolveParticipationsQuery({});
const DEFAULT_INVITATIONS_QUERY = resolveInvitationsQuery({});
const DEFAULT_PAYMENTS_QUERY = resolvePaymentsQuery({});

type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard/my-events",
    label: "My Events",
    description: "Manage hosted events, participants, and invitations.",
    icon: CalendarRangeIcon,
  },
  {
    href: "/dashboard/participations",
    label: "Participations",
    description: "Track the events you joined and their approval state.",
    icon: UsersRoundIcon,
  },
  {
    href: "/dashboard/invitations",
    label: "Invitations",
    description: "Review received invites and monitor the ones you send.",
    icon: MailIcon,
  },
  {
    href: "/dashboard/payments",
    label: "Payments",
    description: "Track payment history, gateway results, and return states.",
    icon: CreditCardIcon,
  },
  {
    href: "/dashboard/settings/myprofile",
    label: "My Profile",
    description: "Review and update account details.",
    icon: UserRoundIcon,
  },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const prefetchDashboardRoute = React.useCallback(
    (href: string) => {
      if (href === "/dashboard/my-events") {
        void queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.myEvents(DEFAULT_MY_EVENTS_QUERY),
          queryFn: ({ signal }) => getMyEvents(DEFAULT_MY_EVENTS_QUERY, signal),
        });
        return;
      }

      if (href === "/dashboard/participations") {
        void queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.myParticipations(DEFAULT_PARTICIPATIONS_QUERY),
          queryFn: ({ signal }) =>
            getMyParticipations(DEFAULT_PARTICIPATIONS_QUERY, signal),
        });
        return;
      }

      if (href === "/dashboard/invitations") {
        void queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.myInvitations(DEFAULT_INVITATIONS_QUERY),
          queryFn: ({ signal }) =>
            getMyInvitations(DEFAULT_INVITATIONS_QUERY, signal),
        });
        return;
      }

      if (href === "/dashboard/payments") {
        void queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.myPayments(DEFAULT_PAYMENTS_QUERY),
          queryFn: ({ signal }) => getMyPayments(DEFAULT_PAYMENTS_QUERY, signal),
        });
      }
    },
    [queryClient]
  );

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg">
              Dashboard
              <Menu className="size-4" data-icon="inline-end" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Dashboard</SheetTitle>
              <SheetDescription>
                Navigate through your Meetrix dashboard sections.
              </SheetDescription>
            </SheetHeader>
            <DashboardSidebarContent
              pathname={pathname}
              onPrefetch={prefetchDashboardRoute}
            />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-4">
          <DashboardSidebarContent
            pathname={pathname}
            onPrefetch={prefetchDashboardRoute}
          />
        </div>
      </aside>
    </>
  );
}

function DashboardSidebarContent({
  pathname,
  onPrefetch,
}: {
  pathname: string;
  onPrefetch: (href: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          <LayoutDashboardIcon className="size-3.5" />
          Workspace
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep events, invitations, payments, and profile details in one place.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {dashboardNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => onPrefetch(item.href)}
              onFocus={() => onPrefetch(item.href)}
              className={cn(
                "rounded-[1.5rem] border px-4 py-3 transition-colors",
                isActive
                  ? "border-border bg-secondary text-secondary-foreground"
                  : "border-transparent bg-background text-foreground hover:border-border hover:bg-muted"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "rounded-2xl border p-2",
                    isActive
                      ? "border-border bg-background"
                      : "border-border bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[1.5rem] border border-border bg-muted/40 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-border bg-background p-2">
            <HouseIcon className="size-4 text-foreground" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Public site</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Need to leave the dashboard? Head back to the public homepage any
              time.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DashboardSidebar };
