"use client";

import * as React from "react";
import Link from "next/link";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRangeIcon,
  MailIcon,
  MapPinIcon,
  ShieldIcon,
  TicketIcon,
  UsersRoundIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DashboardBadge,
  DashboardBreadcrumbs,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardField,
  DashboardFilterSelect,
  DashboardPagination,
  DashboardSearchInput,
  DashboardTableSurface,
  DashboardTableToolbar,
  DashboardTextareaField,
} from "@/components/dashboard/dashboard-ui";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardQueryKeys } from "@/lib/dashboard-query-keys";
import {
  formatDashboardDate,
  formatDashboardDateTime,
  formatDashboardEnum,
  formatDashboardPricing,
} from "@/lib/dashboard-display";
import {
  approveParticipant,
  banParticipant,
  rejectParticipant,
} from "@/lib/participation-api";
import {
  cancelInvitation,
  createInvitation,
  getSentInvitations,
} from "@/lib/invitation-api";
import {
  DEFAULT_EVENT_PARTICIPANTS_LIMIT,
  DEFAULT_EVENT_PARTICIPANTS_PAGE,
  deleteManagedEvent,
  getEventParticipants,
  type EventParticipantsQuery,
  type EventParticipantsResult,
} from "@/lib/managed-events-api";
import type {
  AuthenticatedItemResult,
  BanParticipantPayload,
  EventParticipant,
  InvitationRecord,
  ManagedEvent,
  ParticipantStatus,
  RejectParticipantPayload,
} from "@/lib/dashboard-contract";
import type { ResolvedInvitationsQuery } from "@/lib/invitations-route";

type EventWorkspaceSection = "overview" | "participants" | "invitations";
type WorkspaceNotice = {
  tone: "success" | "danger";
  message: string;
};

type ParticipantActionState = {
  participant: EventParticipant;
  mode: "approve" | "reject" | "ban";
};

const SENT_STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const PARTICIPANT_STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Banned", value: "BANNED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

function MyEventDetailsPage({
  eventResult,
  initialSection,
  initialParticipantsResult,
  initialSentInvitationsResult,
}: {
  eventResult: AuthenticatedItemResult<ManagedEvent>;
  initialSection: EventWorkspaceSection;
  initialParticipantsResult: EventParticipantsResult;
  initialSentInvitationsResult: {
    data: InvitationRecord[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    } | null;
    errorMessage: string | null;
    errorStatus: number | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [notice, setNotice] = React.useState<WorkspaceNotice | null>(null);
  const [participantSearchInput, setParticipantSearchInput] = React.useState("");
  const [sentInvitationSearchInput, setSentInvitationSearchInput] =
    React.useState("");
  const [participantFilters, setParticipantFilters] =
    React.useState<EventParticipantsQuery>({
      page: DEFAULT_EVENT_PARTICIPANTS_PAGE,
      limit: DEFAULT_EVENT_PARTICIPANTS_LIMIT,
    });
  const [sentInvitationFilters, setSentInvitationFilters] =
    React.useState<ResolvedInvitationsQuery>({
      tab: "sent",
      page: 1,
      limit: 10,
      eventId: eventResult.data?.id,
    });
  const [participantActionState, setParticipantActionState] =
    React.useState<ParticipantActionState | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);

  const activeSection = resolveSection(
    searchParams.get("section") ?? initialSection
  );
  const event = eventResult.data;

  React.useEffect(() => {
    setSentInvitationFilters((currentValue) => ({
      ...currentValue,
      eventId: event?.id,
    }));
  }, [event?.id]);

  React.useEffect(() => {
    const normalizedSearchTerm = participantSearchInput.trim();

    if (normalizedSearchTerm === (participantFilters.searchTerm ?? "")) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setParticipantFilters((currentValue) => ({
        ...currentValue,
        page: DEFAULT_EVENT_PARTICIPANTS_PAGE,
        searchTerm: normalizedSearchTerm || undefined,
      }));
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [participantFilters.searchTerm, participantSearchInput]);

  React.useEffect(() => {
    const normalizedSearchTerm = sentInvitationSearchInput.trim();

    if (normalizedSearchTerm === (sentInvitationFilters.searchTerm ?? "")) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSentInvitationFilters((currentValue) => ({
        ...currentValue,
        page: 1,
        searchTerm: normalizedSearchTerm || undefined,
      }));
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [sentInvitationFilters.searchTerm, sentInvitationSearchInput]);

  const participantsQuery = useQuery({
    queryKey: event
      ? dashboardQueryKeys.eventParticipants(event.id, participantFilters)
      : ["event-participants", "missing"],
    queryFn: ({ signal }) =>
      event
        ? getEventParticipants(event.id, participantFilters, signal)
        : Promise.resolve({
            data: null,
            meta: null,
            errorMessage: "Event not found.",
            errorStatus: 404,
          }),
    enabled: activeSection === "participants",
    placeholderData: keepPreviousData,
    initialData:
      initialSection === "participants" ? initialParticipantsResult : undefined,
  });

  const sentInvitationsQuery = useQuery({
    queryKey: dashboardQueryKeys.sentInvitations(sentInvitationFilters),
    queryFn: ({ signal }) => getSentInvitations(sentInvitationFilters, signal),
    enabled: activeSection === "invitations" && Boolean(event?.id),
    placeholderData: keepPreviousData,
    initialData:
      initialSection === "invitations" ? initialSentInvitationsResult : undefined,
  });

  const approveParticipantMutation = useMutation({
    mutationFn: ({
      participantId,
      payload,
    }: {
      participantId: string;
      payload: { approvalNote?: string };
    }) => approveParticipant(participantId, payload),
    onSuccess: (result) => {
      setNotice({ tone: "success", message: result.message });
      setParticipantActionState(null);
      void queryClient.invalidateQueries({
        queryKey: ["event-participants", event?.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: (error) => {
      setNotice({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to approve this participant right now.",
      });
    },
  });

  const rejectParticipantMutation = useMutation({
    mutationFn: ({
      participantId,
      payload,
    }: {
      participantId: string;
      payload: RejectParticipantPayload;
    }) => rejectParticipant(participantId, payload),
    onSuccess: (result) => {
      setNotice({ tone: "success", message: result.message });
      setParticipantActionState(null);
      void queryClient.invalidateQueries({
        queryKey: ["event-participants", event?.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: (error) => {
      setNotice({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to reject this participant right now.",
      });
    },
  });

  const banParticipantMutation = useMutation({
    mutationFn: ({
      participantId,
      payload,
    }: {
      participantId: string;
      payload: BanParticipantPayload;
    }) => banParticipant(participantId, payload),
    onSuccess: (result) => {
      setNotice({ tone: "success", message: result.message });
      setParticipantActionState(null);
      void queryClient.invalidateQueries({
        queryKey: ["event-participants", event?.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: (error) => {
      setNotice({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to ban this participant right now.",
      });
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: createInvitation,
    onSuccess: (result) => {
      setNotice({ tone: "success", message: result.message });
      setIsInviteDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["sent-invitations"] });
    },
    onError: (error) => {
      setNotice({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send this invitation right now.",
      });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: (result) => {
      setNotice({ tone: "success", message: result.message });
      void queryClient.invalidateQueries({ queryKey: ["sent-invitations"] });
    },
    onError: (error) => {
      setNotice({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to cancel this invitation right now.",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => deleteManagedEvent(eventId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-events"] }),
        queryClient.invalidateQueries({ queryKey: ["sent-invitations"] }),
        queryClient.invalidateQueries({ queryKey: ["event-participants", event?.id] }),
      ]);
      router.push("/dashboard/my-events");
      router.refresh();
    },
    onError: (error) => {
      setNotice({
        tone: "danger",
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete this event right now.",
      });
    },
  });

  function handleDeleteEvent() {
    if (!event) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${event.title}"?\n\nThis will remove it from discovery, cancel and archive it for attendees, and close active host management for this event.`
    );

    if (!confirmed) {
      return;
    }

    deleteEventMutation.mutate(event.id);
  }

  function changeSection(section: EventWorkspaceSection) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (section === "overview") {
      nextSearchParams.delete("section");
    } else {
      nextSearchParams.set("section", section);
    }

    const nextValue = nextSearchParams.toString();
    window.history.pushState(
      null,
      "",
      nextValue ? `${pathname}?${nextValue}` : pathname
    );
  }

  if (!event) {
    return (
      <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
        <DashboardBreadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Events", href: "/dashboard/my-events" },
            { label: "Event" },
          ]}
        />
        <DashboardErrorState
          title="We couldn't load this event"
          description={eventResult.errorMessage ?? "Please try again in a moment."}
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-8 sm:px-6 lg:px-8">
      <DashboardBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Events", href: "/dashboard/my-events" },
          { label: event.title },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/my-events">Back to my events</Link>
          </Button>
        }
      />

      {notice ? (
        <p
          className={
            notice.tone === "success"
              ? "rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
              : "rounded-[1.5rem] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {notice.message}
        </p>
      ) : null}

      <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <SectionButton
            active={activeSection === "overview"}
            onClick={() => changeSection("overview")}
          >
            Overview
          </SectionButton>
          <SectionButton
            active={activeSection === "participants"}
            onClick={() => changeSection("participants")}
          >
            Participants
          </SectionButton>
          <SectionButton
            active={activeSection === "invitations"}
            onClick={() => changeSection("invitations")}
          >
            Invitations
          </SectionButton>
        </div>
      </section>

      {activeSection === "overview" ? (
        <OverviewSection
          event={event}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href={`/dashboard/my-events/${event.id}/edit`}>Edit event</Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteEventMutation.isPending}
                onClick={handleDeleteEvent}
              >
                {deleteEventMutation.isPending ? "Deleting..." : "Delete event"}
              </Button>
            </>
          }
        />
      ) : null}

      {activeSection === "participants" ? (
        <section className="flex flex-col gap-6">
          <ParticipantsToolbar
            searchValue={participantSearchInput}
            statusValue={participantFilters.status ?? ""}
            isPending={participantsQuery.isFetching}
            onSearchValueChange={setParticipantSearchInput}
            onStatusChange={(value) =>
              setParticipantFilters((currentValue) => ({
                ...currentValue,
                page: 1,
                status: (value || undefined) as ParticipantStatus | undefined,
              }))
            }
            onReset={() => {
              setParticipantSearchInput("");
              setParticipantFilters({
                page: DEFAULT_EVENT_PARTICIPANTS_PAGE,
                limit: DEFAULT_EVENT_PARTICIPANTS_LIMIT,
              });
            }}
          />

          {participantsQuery.isLoading && !participantsQuery.data ? (
            <SectionListSkeleton />
          ) : participantsQuery.data?.errorMessage ? (
            <DashboardErrorState
              title="We couldn't load participants"
              description={participantsQuery.data.errorMessage}
              onRetry={() => void participantsQuery.refetch()}
            />
          ) : participantsQuery.data?.data?.participants?.length ? (
            <>
              <DashboardTableSurface>
                <Table className="min-w-[1120px]">
                  <TableHeader className="bg-muted/25">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-5 py-4">Participant</TableHead>
                      <TableHead className="px-5 py-4">Timeline</TableHead>
                      <TableHead className="px-5 py-4">Access</TableHead>
                      <TableHead className="px-5 py-4">Notes</TableHead>
                      <TableHead className="px-5 py-4 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participantsQuery.data.data.participants.map((participant) => (
                      <ParticipantTableRow
                        key={participant.id}
                        participant={participant}
                        onApprove={() =>
                          setParticipantActionState({
                            participant,
                            mode: "approve",
                          })
                        }
                        onReject={() =>
                          setParticipantActionState({
                            participant,
                            mode: "reject",
                          })
                        }
                        onBan={() =>
                          setParticipantActionState({
                            participant,
                            mode: "ban",
                          })
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              </DashboardTableSurface>

              {participantsQuery.data.meta ? (
                <DashboardPagination
                  meta={participantsQuery.data.meta}
                  isPending={participantsQuery.isFetching}
                  onPageChange={(page) =>
                    setParticipantFilters((currentValue) => ({
                      ...currentValue,
                      page,
                    }))
                  }
                />
              ) : null}
            </>
          ) : (
            <DashboardEmptyState
              title="No participants matched this view."
              description="Try a broader search or clear the participant filters to see more records."
              action={
                <Button
                  type="button"
                  onClick={() => {
                    setParticipantSearchInput("");
                    setParticipantFilters({
                      page: DEFAULT_EVENT_PARTICIPANTS_PAGE,
                      limit: DEFAULT_EVENT_PARTICIPANTS_LIMIT,
                    });
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </section>
      ) : null}

      {activeSection === "invitations" ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" onClick={() => setIsInviteDialogOpen(true)}>
              Send invitation
            </Button>
          </div>

          <InvitationsToolbar
            searchValue={sentInvitationSearchInput}
            statusValue={sentInvitationFilters.status ?? ""}
            isPending={sentInvitationsQuery.isFetching}
            onSearchValueChange={setSentInvitationSearchInput}
            onStatusChange={(value) =>
              setSentInvitationFilters((currentValue) => ({
                ...currentValue,
                page: 1,
                status: (value || undefined) as ResolvedInvitationsQuery["status"],
              }))
            }
            onReset={() => {
              setSentInvitationSearchInput("");
              setSentInvitationFilters({
                tab: "sent",
                page: 1,
                limit: 10,
                eventId: event.id,
              });
            }}
          />

          {sentInvitationsQuery.isLoading && !sentInvitationsQuery.data ? (
            <SectionListSkeleton />
          ) : sentInvitationsQuery.data?.errorMessage ? (
            <DashboardErrorState
              title="We couldn't load sent invitations"
              description={sentInvitationsQuery.data.errorMessage}
              onRetry={() => void sentInvitationsQuery.refetch()}
            />
          ) : sentInvitationsQuery.data?.data?.length ? (
            <>
              <DashboardTableSurface>
                <Table className="min-w-[1120px]">
                  <TableHeader className="bg-muted/25">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-5 py-4">Invitee</TableHead>
                      <TableHead className="px-5 py-4">Timeline</TableHead>
                      <TableHead className="px-5 py-4">Status</TableHead>
                      <TableHead className="px-5 py-4">Message</TableHead>
                      <TableHead className="px-5 py-4 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentInvitationsQuery.data.data.map((invitation) => (
                      <HostInvitationTableRow
                        key={invitation.id}
                        invitation={invitation}
                        isCancelling={cancelInvitationMutation.variables === invitation.id}
                        onCancel={() => cancelInvitationMutation.mutate(invitation.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </DashboardTableSurface>

              {sentInvitationsQuery.data.meta ? (
                <DashboardPagination
                  meta={sentInvitationsQuery.data.meta}
                  isPending={sentInvitationsQuery.isFetching}
                  onPageChange={(page) =>
                    setSentInvitationFilters((currentValue) => ({
                      ...currentValue,
                      page,
                    }))
                  }
                />
              ) : null}
            </>
          ) : (
            <DashboardEmptyState
              title="No invitations matched this event view."
              description="Send a new invitation or clear the current filters to see more results."
              action={
                <Button type="button" onClick={() => setIsInviteDialogOpen(true)}>
                  Send invitation
                </Button>
              }
            />
          )}
        </section>
      ) : null}

      <ParticipantActionDialog
        actionState={participantActionState}
        isSubmitting={
          approveParticipantMutation.isPending ||
          rejectParticipantMutation.isPending ||
          banParticipantMutation.isPending
        }
        onOpenChange={(open) => {
          if (!open) {
            setParticipantActionState(null);
          }
        }}
        onSubmit={(value) => {
          if (!participantActionState) {
            return;
          }

          if (participantActionState.mode === "approve") {
            approveParticipantMutation.mutate({
              participantId: participantActionState.participant.id,
              payload: {
                approvalNote: value || undefined,
              },
            });
            return;
          }

          if (participantActionState.mode === "reject") {
            rejectParticipantMutation.mutate({
              participantId: participantActionState.participant.id,
              payload: {
                rejectionReason: value,
              },
            });
            return;
          }

          banParticipantMutation.mutate({
            participantId: participantActionState.participant.id,
            payload: {
              reason: value || undefined,
            },
          });
        }}
      />

      <CreateInvitationDialog
        eventId={event.id}
        isOpen={isInviteDialogOpen}
        isSubmitting={createInvitationMutation.isPending}
        onOpenChange={setIsInviteDialogOpen}
        onSubmit={(payload) => createInvitationMutation.mutate(payload)}
      />
    </main>
  );
}

function OverviewSection({
  event,
  actions,
}: {
  event: ManagedEvent;
  actions?: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <DashboardBadge tone={getEventTone(event.status)}>
                {formatDashboardEnum(event.status)}
              </DashboardBadge>
              <DashboardBadge>{formatDashboardEnum(event.visibility)}</DashboardBadge>
              <DashboardBadge>
                {event.locationType === "ONLINE" ? "Online" : "Offline"}
              </DashboardBadge>
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Event overview
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <OverviewItem
          icon={<CalendarRangeIcon className="size-4" />}
          label="Start date"
          value={formatDashboardDateTime(event.startsAt)}
        />
        <OverviewItem
          icon={<TicketIcon className="size-4" />}
          label="Pricing"
          value={formatDashboardPricing(event)}
        />
        <OverviewItem
          icon={<UsersRoundIcon className="size-4" />}
          label="Participants"
          value={`${event.participantCount} tracked`}
        />
        <OverviewItem
          icon={<MapPinIcon className="size-4" />}
          label="Location"
          value={
            event.locationType === "ONLINE"
              ? event.eventLink ?? "Online event"
              : event.venue ?? "Venue to be announced"
          }
        />
        <OverviewItem
          icon={<ShieldIcon className="size-4" />}
          label="Capacity"
          value={event.capacity ? `${event.capacity} seats` : "No limit"}
        />
        <OverviewItem
          icon={<MailIcon className="size-4" />}
          label="Updated"
          value={formatDashboardDate(event.updatedAt)}
        />
      </div>
    </section>
  );
}

function ParticipantsToolbar({
  searchValue,
  statusValue,
  isPending,
  onSearchValueChange,
  onStatusChange,
  onReset,
}: {
  searchValue: string;
  statusValue: string;
  isPending: boolean;
  onSearchValueChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <DashboardTableToolbar
      controls={
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.5fr)]">
          <DashboardSearchInput
            value={searchValue}
            onChange={onSearchValueChange}
            placeholder="Search by participant name or email"
            disabled={isPending}
          />

          <DashboardFilterSelect
            label="Status"
            value={statusValue}
            onChange={onStatusChange}
            disabled={isPending}
            options={PARTICIPANT_STATUS_OPTIONS}
          />
        </div>
      }
      actions={
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      }
    />
  );
}

function InvitationsToolbar({
  searchValue,
  statusValue,
  isPending,
  onSearchValueChange,
  onStatusChange,
  onReset,
}: {
  searchValue: string;
  statusValue: string;
  isPending: boolean;
  onSearchValueChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <DashboardTableToolbar
      controls={
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.5fr)]">
          <DashboardSearchInput
            value={searchValue}
            onChange={onSearchValueChange}
            placeholder="Search by invitee or event"
            disabled={isPending}
          />

          <DashboardFilterSelect
            label="Status"
            value={statusValue}
            onChange={onStatusChange}
            disabled={isPending}
            options={SENT_STATUS_OPTIONS}
          />
        </div>
      }
      actions={
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      }
    />
  );
}

const ParticipantTableRow = React.memo(function ParticipantTableRow({
  participant,
  onApprove,
  onReject,
  onBan,
}: {
  participant: EventParticipant;
  onApprove: () => void;
  onReject: () => void;
  onBan: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[16rem] flex-col gap-2">
          <p className="font-medium text-foreground">{participant.user.name}</p>
          <p className="text-sm text-muted-foreground">{participant.user.email}</p>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[14rem] flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            Joined {formatDashboardDateTime(participant.joinedAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            Approved {formatDashboardDateTime(participant.approvedAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            Responded {formatDashboardDateTime(participant.respondedAt)}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[14rem] flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <DashboardBadge tone={getParticipantTone(participant.status)}>
              {formatDashboardEnum(participant.status)}
            </DashboardBadge>
            <DashboardBadge tone={getPaymentTone(participant.paymentStatus)}>
              {formatDashboardEnum(participant.paymentStatus)}
            </DashboardBadge>
            <DashboardBadge>{formatDashboardEnum(participant.joinType)}</DashboardBadge>
          </div>
          <span className="text-sm text-muted-foreground">
            Approved by {participant.approvedBy?.name ?? "Not assigned"}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="max-w-sm space-y-2 text-sm text-muted-foreground">
          {participant.approvalNote ? <p>Approval note: {participant.approvalNote}</p> : null}
          {participant.rejectionReason ? <p>Reason: {participant.rejectionReason}</p> : null}
          {!participant.approvalNote && !participant.rejectionReason ? (
            <p>No notes yet.</p>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" onClick={onApprove}>
            Approve
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onReject}>
            Reject
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={onBan}>
            Ban
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

const HostInvitationTableRow = React.memo(function HostInvitationTableRow({
  invitation,
  isCancelling,
  onCancel,
}: {
  invitation: InvitationRecord;
  isCancelling: boolean;
  onCancel: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[16rem] flex-col gap-2">
          <p className="font-medium text-foreground">
            {invitation.invitee.name || invitation.invitee.email}
          </p>
          <p className="text-sm text-muted-foreground">{invitation.invitee.email}</p>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[14rem] flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            Event {formatDashboardDateTime(invitation.event.startsAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            Expires {formatDashboardDateTime(invitation.expiresAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDashboardPricing(invitation.event)}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <div className="flex min-w-[12rem] flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <DashboardBadge tone={getInvitationTone(invitation.status)}>
              {formatDashboardEnum(invitation.status)}
            </DashboardBadge>
            <DashboardBadge tone={getPaymentTone(invitation.paymentStatus)}>
              {formatDashboardEnum(invitation.paymentStatus)}
            </DashboardBadge>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4 whitespace-normal">
        <p className="max-w-sm text-sm text-muted-foreground">
          {invitation.message ?? "No message included."}
        </p>
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        {invitation.status === "PENDING" ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isCancelling}
            onClick={onCancel}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">No action</span>
        )}
      </TableCell>
    </TableRow>
  );
});

function ParticipantActionDialog({
  actionState,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  actionState: ParticipantActionState | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    setValue("");
  }, [actionState]);

  const isReject = actionState?.mode === "reject";
  const isOpen = Boolean(actionState);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {actionState
              ? `${formatDashboardEnum(actionState.mode)} ${actionState.participant.user.name}`
              : "Participant action"}
          </SheetTitle>
          <SheetDescription>
            {isReject
              ? "Provide the required reason before rejecting this participant."
              : "Add an optional note for this moderation action."}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (isReject && !value.trim()) {
                return;
              }

              onSubmit(value.trim());
            }}
          >
            <DashboardTextareaField
              label={
                isReject
                  ? "Reason"
                  : actionState?.mode === "approve"
                    ? "Approval note"
                    : "Ban reason"
              }
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={
                isReject
                  ? "Explain why this participant is being rejected."
                  : "Add context if helpful."
              }
            />

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting || (isReject && !value.trim())}>
                {isSubmitting
                  ? "Saving..."
                  : actionState
                    ? formatDashboardEnum(actionState.mode)
                    : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CreateInvitationDialog({
  eventId,
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  eventId: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    eventId: string;
    inviteeEmail: string;
    message?: string;
    expiresAt?: string;
  }) => void;
}) {
  const [inviteeEmail, setInviteeEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setInviteeEmail("");
      setMessage("");
      setExpiresAt("");
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Send invitation</SheetTitle>
          <SheetDescription>
            Invite a participant to this event and track the response from the
            event workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (!inviteeEmail.trim()) {
                return;
              }

              onSubmit({
                eventId,
                inviteeEmail: inviteeEmail.trim(),
                message: message.trim() || undefined,
                expiresAt: expiresAt || undefined,
              });
            }}
          >
            <DashboardField
              label="Invitee email"
              type="email"
              value={inviteeEmail}
              onChange={(event) => setInviteeEmail(event.target.value)}
              placeholder="guest@example.com"
            />
            <DashboardField
              label="Expires at"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
            <DashboardTextareaField
              label="Message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Optional note for the invitee."
            />

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting || !inviteeEmail.trim()}>
                {isSubmitting ? "Sending..." : "Send invitation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionListSkeleton() {
  return (
    <section className="overflow-hidden rounded-md border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[1120px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr] gap-4 border-b border-border bg-muted/25 px-5 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-24" />
            ))}
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr] gap-4 px-5 py-4"
              >
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40 max-w-full" />
                  <Skeleton className="h-4 w-32 max-w-full" />
                </div>
                {Array.from({ length: 3 }).map((__, cellIndex) => (
                  <div key={cellIndex} className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28 max-w-full" />
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
  );
}

function SectionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function OverviewItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-sm font-medium leading-6 text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function resolveSection(value: string | EventWorkspaceSection): EventWorkspaceSection {
  if (value === "participants" || value === "invitations") {
    return value;
  }

  return "overview";
}

function getEventTone(status: ManagedEvent["status"]) {
  if (status === "PUBLISHED") {
    return "success";
  }

  if (status === "DRAFT") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "info";
}

function getParticipantTone(status: EventParticipant["status"]) {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  if (status === "REJECTED" || status === "BANNED" || status === "CANCELLED") {
    return "danger";
  }

  return "default";
}

function getInvitationTone(status: InvitationRecord["status"]) {
  if (status === "ACCEPTED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  if (status === "DECLINED" || status === "EXPIRED" || status === "CANCELLED") {
    return "danger";
  }

  return "default";
}

function getPaymentTone(
  status: EventParticipant["paymentStatus"] | InvitationRecord["paymentStatus"]
) {
  if (status === "PAID") {
    return "success";
  }

  if (status === "PENDING" || status === "UNPAID") {
    return "warning";
  }

  if (status === "FAILED" || status === "CANCELLED" || status === "REFUNDED") {
    return "danger";
  }

  return "default";
}

export { MyEventDetailsPage };
