"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  LayoutDashboardIcon,
  MenuIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Jump back to your main workspace.",
    icon: LayoutDashboardIcon,
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

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg">
              Open dashboard menu
              <MenuIcon data-icon="inline-end" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Dashboard menu</SheetTitle>
              <SheetDescription>
                Navigate through your Meetrix dashboard sections.
              </SheetDescription>
            </SheetHeader>
            <DashboardSidebarContent pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-4">
          <DashboardSidebarContent pathname={pathname} />
        </div>
      </aside>
    </>
  );
}

function DashboardSidebarContent({ pathname }: { pathname: string }) {
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
            Move between your account areas without losing the page structure.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {dashboardNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
