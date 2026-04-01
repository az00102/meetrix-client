"use client";

import * as React from "react";
import { ArrowUpDownIcon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  EventLocationType,
  EventPricingType,
  EventSortBy,
  EventSortOrder,
} from "@/lib/event-contract";
import {
  DEFAULT_EVENTS_PAGE,
  DEFAULT_EVENTS_SORT_BY,
  DEFAULT_EVENTS_SORT_ORDER,
  type ResolvedPublicEventsQuery,
} from "@/lib/events-route";

const PRICING_OPTIONS = [
  { label: "All pricing", value: undefined },
  { label: "Free", value: "FREE" },
  { label: "Paid", value: "PAID" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: EventPricingType | undefined;
}>;

const LOCATION_OPTIONS = [
  { label: "All locations", value: undefined },
  { label: "Online", value: "ONLINE" },
  { label: "In person", value: "OFFLINE" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: EventLocationType | undefined;
}>;

const SORT_OPTIONS = [
  { label: "Soonest first", sortBy: "startsAt", sortOrder: "asc" },
  { label: "Latest added", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Recently updated", sortBy: "updatedAt", sortOrder: "desc" },
  { label: "Title A-Z", sortBy: "title", sortOrder: "asc" },
  { label: "Title Z-A", sortBy: "title", sortOrder: "desc" },
] as const satisfies ReadonlyArray<{
  label: string;
  sortBy: EventSortBy;
  sortOrder: EventSortOrder;
}>;

function EventsControls({
  query,
  totalResults,
  totalPages,
  currentPage,
  isPending,
  onQueryChange,
}: {
  query: ResolvedPublicEventsQuery;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  isPending: boolean;
  onQueryChange: (nextQuery: ResolvedPublicEventsQuery) => void;
}) {
  const [searchTerm, setSearchTerm] = React.useState(query.searchTerm ?? "");
  const selectedSortValue = `${query.sortBy}-${query.sortOrder}`;
  const hasFilters = Boolean(query.searchTerm || query.pricingType || query.locationType);

  React.useEffect(() => {
    setSearchTerm(query.searchTerm ?? "");
  }, [query.searchTerm]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onQueryChange({
      ...query,
      searchTerm: searchTerm.trim() || undefined,
      page: DEFAULT_EVENTS_PAGE,
    });
  }

  function handlePricingChange(pricingType: EventPricingType | undefined) {
    onQueryChange({
      ...query,
      pricingType,
      page: DEFAULT_EVENTS_PAGE,
    });
  }

  function handleLocationChange(locationType: EventLocationType | undefined) {
    onQueryChange({
      ...query,
      locationType,
      page: DEFAULT_EVENTS_PAGE,
    });
  }

  function handleSortChange(value: string) {
    const option = SORT_OPTIONS.find(
      (item) => `${item.sortBy}-${item.sortOrder}` === value
    );

    onQueryChange({
      ...query,
      sortBy: option?.sortBy ?? DEFAULT_EVENTS_SORT_BY,
      sortOrder: option?.sortOrder ?? DEFAULT_EVENTS_SORT_ORDER,
      page: DEFAULT_EVENTS_PAGE,
    });
  }

  function resetFilters() {
    onQueryChange({
      ...query,
      searchTerm: undefined,
      pricingType: undefined,
      locationType: undefined,
      page: DEFAULT_EVENTS_PAGE,
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-border/80 bg-background p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
        <form className="flex gap-3" onSubmit={handleSearchSubmit}>
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-[20px] border border-border bg-background px-4">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search events or hosts"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="flex flex-col gap-3 lg:items-end">
          <FilterGroup label="Pricing">
            {PRICING_OPTIONS.map((option) => (
              <Button
                key={option.label}
                type="button"
                size="sm"
                variant={query.pricingType === option.value ? "secondary" : "ghost"}
                onClick={() => handlePricingChange(option.value)}
                disabled={isPending}
              >
                {option.label}
              </Button>
            ))}
          </FilterGroup>

          <FilterGroup label="Location">
            {LOCATION_OPTIONS.map((option) => (
              <Button
                key={option.label}
                type="button"
                size="sm"
                variant={query.locationType === option.value ? "secondary" : "ghost"}
                onClick={() => handleLocationChange(option.value)}
                disabled={isPending}
              >
                {option.label}
              </Button>
            ))}
          </FilterGroup>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-foreground">
            {totalResults} event{totalResults === 1 ? "" : "s"}
          </p>
          {totalPages > 0 ? (
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          ) : null}
          {isPending ? (
            <p className="text-sm text-muted-foreground">Updating...</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-[16px] border border-border bg-background px-3">
            <ArrowUpDownIcon className="size-4 text-muted-foreground" />
            <select
              value={selectedSortValue}
              onChange={(event) => handleSortChange(event.target.value)}
              className="h-10 bg-transparent pr-2 text-sm text-foreground outline-none"
              disabled={isPending}
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={`${option.sortBy}-${option.sortOrder}`}
                  value={`${option.sortBy}-${option.sortOrder}`}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilters ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetFilters}
              disabled={isPending}
            >
              <XIcon data-icon="inline-start" />
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export { EventsControls };
