import type { ApiEnvelope, PaginationMeta } from "@/lib/api-contract";
import type {
  EventLocationType,
  EventPricingType,
  EventVisibility,
  PublicEventDetail,
  PublicEventOwner,
} from "@/lib/event-contract";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "UNPAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";
type PaymentProvider = "SSLCOMMERZ" | "SHURJOPAY" | "MANUAL";
type PaymentPurpose = "EVENT_REGISTRATION" | "INVITATION_ACCEPTANCE";
type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
type ParticipationJoinType = "DIRECT" | "REQUEST" | "INVITED";
type ParticipantStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "BANNED"
  | "CANCELLED";
type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED";

type DashboardUserSummary = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type DashboardApproverSummary = {
  id: string;
  name: string;
  email: string;
};

type EventAccessSummary = {
  id: string;
  title: string;
  slug: string;
  visibility: EventVisibility;
  pricingType: EventPricingType;
  registrationFee: number;
  currency: string;
  startsAt: string;
  requiresPayment: boolean;
  requiresApproval: boolean;
};

type ParticipationEventSummary = EventAccessSummary & {
  owner: PublicEventOwner;
};

type InvitationEventSummary = EventAccessSummary & {
  ownerId: string;
};

type PaymentEventSummary = EventAccessSummary & {
  owner: PublicEventOwner;
};

type ParticipationRecord = {
  id: string;
  joinType: ParticipationJoinType;
  status: ParticipantStatus;
  paymentStatus: PaymentStatus;
  approvalNote: string | null;
  rejectionReason: string | null;
  respondedAt: string | null;
  approvedAt: string | null;
  joinedAt: string | null;
  bannedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: ParticipationEventSummary;
  user: DashboardUserSummary;
  approvedBy: DashboardApproverSummary | null;
};

type InvitationRecord = {
  id: string;
  status: InvitationStatus;
  paymentStatus: PaymentStatus;
  message: string | null;
  expiresAt: string | null;
  respondedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: InvitationEventSummary;
  invitedBy: DashboardUserSummary;
  invitee: DashboardUserSummary;
};

type ManagedEvent = PublicEventDetail & {
  status: EventStatus;
  participantCount: number;
};

type CreateManagedEventPayload = {
  title: string;
  summary?: string | null;
  description: string;
  startsAt: string;
  endsAt?: string | null;
  timezone: string;
  locationType: EventLocationType;
  venue?: string | null;
  eventLink?: string | null;
  visibility: EventVisibility;
  pricingType: EventPricingType;
  registrationFee: number;
  currency: string;
  capacity?: number | null;
  bannerImage?: string | null;
  status: Extract<EventStatus, "DRAFT" | "PUBLISHED">;
};

type UpdateManagedEventPayload = {
  title?: string;
  summary?: string | null;
  description?: string;
  startsAt?: string;
  endsAt?: string | null;
  timezone?: string;
  locationType?: EventLocationType;
  venue?: string | null;
  eventLink?: string | null;
  visibility?: EventVisibility;
  pricingType?: EventPricingType;
  registrationFee?: number;
  currency?: string;
  capacity?: number | null;
  bannerImage?: string | null;
  status?: Extract<EventStatus, "DRAFT" | "PUBLISHED" | "CANCELLED">;
};

type DeletedManagedEventSummary = {
  id: string;
  slug: string;
  title: string;
};

type EventParticipant = {
  id: string;
  joinType: ParticipationJoinType;
  status: ParticipantStatus;
  paymentStatus: PaymentStatus;
  approvalNote: string | null;
  rejectionReason: string | null;
  respondedAt: string | null;
  approvedAt: string | null;
  joinedAt: string | null;
  bannedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: DashboardUserSummary;
  approvedBy: DashboardApproverSummary | null;
};

type EventParticipantsPayload = {
  event: {
    id: string;
    title: string;
  };
  participants: EventParticipant[];
};

type PaymentRecord = {
  id: string;
  transactionId: string;
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerTransactionId: string | null;
  gatewayStatus: string | null;
  failureReason: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  redirectUrl: string | null;
  manualReviewReason: string | null;
  requiresManualReview: boolean;
  user: DashboardUserSummary;
  event: PaymentEventSummary | null;
  participant: {
    id: string;
    joinType: ParticipationJoinType;
    status: ParticipantStatus;
    paymentStatus: PaymentStatus;
  } | null;
  invitation: {
    id: string;
    status: InvitationStatus;
    paymentStatus: PaymentStatus;
    expiresAt: string | null;
  } | null;
};

type InitiatePaymentPayload =
  | {
      purpose: "EVENT_REGISTRATION";
      eventId: string;
      invitationId?: never;
    }
  | {
      purpose: "INVITATION_ACCEPTANCE";
      invitationId: string;
      eventId?: never;
    };

type PaymentsQuery = {
  page: number;
  limit: number;
  sortBy: "createdAt" | "updatedAt" | "paidAt" | "amount";
  sortOrder: "asc" | "desc";
  searchTerm?: string;
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
};

type PaymentReturnStatus =
  | "success_awaiting_approval"
  | "invitation_accepted"
  | "failed"
  | "cancelled"
  | "processing"
  | "manual_review"
  | "invalid";

type AuthenticatedListResult<T> = {
  data: T[];
  meta: PaginationMeta | null;
  errorMessage: string | null;
  errorStatus: number | null;
};

type AuthenticatedItemResult<T> = {
  data: T | null;
  errorMessage: string | null;
  errorStatus: number | null;
};

type CreateInvitationPayload = {
  eventId: string;
  inviteeEmail: string;
  message?: string;
  expiresAt?: string;
};

type ApproveParticipantPayload = {
  approvalNote?: string;
};

type RejectParticipantPayload = {
  rejectionReason: string;
};

type BanParticipantPayload = {
  reason?: string;
};

export type {
  ApiEnvelope,
  ApproveParticipantPayload,
  AuthenticatedItemResult,
  AuthenticatedListResult,
  BanParticipantPayload,
  DeletedManagedEventSummary,
  CreateManagedEventPayload,
  CreateInvitationPayload,
  DashboardApproverSummary,
  DashboardUserSummary,
  EventParticipant,
  EventParticipantsPayload,
  EventStatus,
  InvitationRecord,
  InvitationStatus,
  InitiatePaymentPayload,
  ManagedEvent,
  ParticipantStatus,
  PaymentEventSummary,
  PaymentProvider,
  PaymentPurpose,
  PaymentRecord,
  PaymentReturnStatus,
  ParticipationJoinType,
  ParticipationRecord,
  PaymentsQuery,
  PaymentStatus,
  RejectParticipantPayload,
  UpdateManagedEventPayload,
};
export type { EventLocationType, EventPricingType, EventVisibility };
