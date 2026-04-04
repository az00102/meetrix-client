import * as React from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DashboardTone = "default" | "success" | "warning" | "danger" | "info";

type DashboardBreadcrumbItem = {
  label: string;
  href?: string;
};

const EMPTY_FILTER_VALUE = "__all__";

function DashboardPageHeader({
  eyebrow = "Dashboard",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

function DashboardBreadcrumbs({
  items,
  actions,
}: {
  items: ReadonlyArray<DashboardBreadcrumbItem>;
  actions?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <span>/</span> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

function DashboardBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: DashboardTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.08em] uppercase",
        tone === "default" && "border-border bg-background text-foreground",
        tone === "success" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" &&
          "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        tone === "danger" &&
          "border-destructive/25 bg-destructive/10 text-destructive",
        tone === "info" &&
          "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
      )}
    >
      {children}
    </span>
  );
}

function DashboardEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
      <div className="flex max-w-2xl flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}

function DashboardErrorState({
  title,
  description,
  retryLabel = "Retry",
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-destructive/20 bg-destructive/5 p-8 shadow-sm">
      <div className="flex max-w-2xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {onRetry ? (
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onRetry}>
              {retryLabel}
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DashboardPagination({
  meta,
  isPending,
  onPageChange,
}: {
  meta: {
    page: number;
    totalPages: number;
  };
  isPending: boolean;
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const pages = buildPaginationRange(meta.page, meta.totalPages);

  return (
    <nav className="flex flex-col gap-4 rounded-md border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {meta.totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={meta.page <= 1 || isPending}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>

        {pages.map((pageNumber) =>
          pageNumber === meta.page ? (
            <Button key={pageNumber} size="sm" variant="secondary" disabled>
              {pageNumber}
            </Button>
          ) : (
            <Button
              key={pageNumber}
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          )
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={meta.page >= meta.totalPages || isPending}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}

function DashboardField({
  label,
  id,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        id={id}
        className={cn(
          "h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20",
          className
        )}
        {...props}
      />
    </label>
  );
}

function DashboardSelectField({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & {
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        className={cn(
          "h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

function DashboardTextareaField({
  label,
  className,
  ...props
}: React.ComponentProps<"textarea"> & {
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <textarea
        className={cn(
          "min-h-28 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20",
          className
        )}
        {...props}
      />
    </label>
  );
}

function DashboardSearchInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  reserveLabelSpace = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  reserveLabelSpace?: boolean;
}) {
  return (
    <div className="grid gap-2">
      {reserveLabelSpace ? (
        <span
          aria-hidden="true"
          className="invisible text-sm font-medium leading-none"
        >
          Search
        </span>
      ) : null}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 rounded-xl bg-background pr-10 pl-10 text-sm leading-none"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onChange("")}
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
          >
            <XIcon />
            <span className="sr-only">Clear search</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function DashboardFilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{
    label: string;
    value: string;
  }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Select
        value={value || EMPTY_FILTER_VALUE}
        onValueChange={(nextValue) =>
          onChange(nextValue === EMPTY_FILTER_VALUE ? "" : nextValue)
        }
        disabled={disabled}
      >
        <SelectTrigger className="h-11 w-full rounded-xl bg-background px-3 text-sm">
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={`${label}-${option.value || "empty"}`}
                value={option.value || EMPTY_FILTER_VALUE}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </label>
  );
}

function DashboardTableToolbar({
  header,
  controls,
  summary,
  actions,
  className,
}: {
  header?: React.ReactNode;
  controls: React.ReactNode;
  summary?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-border/80 bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-5">
        {header ? <div className="flex flex-wrap items-center gap-2">{header}</div> : null}
        {controls}
        {summary || actions ? (
          <div className="flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {summary ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">{summary}</div>
            ) : (
              <div />
            )}
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DashboardTableSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border border-border/80 bg-card shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

function buildPaginationRange(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index
  );
}

export {
  DashboardBadge,
  DashboardBreadcrumbs,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardField,
  DashboardFilterSelect,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchInput,
  DashboardSelectField,
  DashboardTableSurface,
  DashboardTableToolbar,
  DashboardTextareaField,
};
